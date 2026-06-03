-- Multi-item requests and PIN-based receipt confirmation.

alter table public.profiles
  add column if not exists receipt_pin_hash text;

create table if not exists public.request_items (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  part_code text not null,
  part_description text,
  quantity integer not null,
  delivered_quantity integer,
  received_quantity integer,
  created_at timestamptz not null default now(),
  constraint request_items_part_code_not_empty check (length(trim(part_code)) > 0),
  constraint request_items_quantity_positive check (quantity > 0),
  constraint request_items_delivered_quantity_valid check (
    delivered_quantity is null or delivered_quantity between 0 and quantity
  ),
  constraint request_items_received_quantity_valid check (
    received_quantity is null or received_quantity between 0 and quantity
  )
);

create table if not exists public.request_receipts (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  received_by uuid not null references public.profiles(id),
  delivered_by uuid references public.profiles(id),
  method text not null default 'pin',
  confirmed_quantity integer not null,
  comment text,
  created_at timestamptz not null default now(),
  constraint request_receipts_method_valid check (method in ('pin', 'signature', 'qr', 'manual')),
  constraint request_receipts_confirmed_quantity_positive check (confirmed_quantity > 0)
);

create unique index if not exists request_items_request_part_code_idx
  on public.request_items(request_id, lower(part_code));

create index if not exists request_items_request_id_idx
  on public.request_items(request_id);

create index if not exists request_items_part_code_lower_idx
  on public.request_items(lower(part_code));

create index if not exists request_receipts_request_created_at_idx
  on public.request_receipts(request_id, created_at desc);

create index if not exists request_receipts_received_by_created_at_idx
  on public.request_receipts(received_by, created_at desc);

insert into public.request_items (
  request_id,
  part_code,
  part_description,
  quantity,
  delivered_quantity,
  received_quantity,
  created_at
)
select
  r.id,
  r.part_code,
  r.part_description,
  r.quantity,
  case when r.status in ('surtida', 'recibida') then r.quantity else null end,
  case when r.status = 'recibida' then r.quantity else null end,
  r.created_at
from public.requests r
where not exists (
  select 1
  from public.request_items ri
  where ri.request_id = r.id
);

alter table public.request_items enable row level security;
alter table public.request_receipts enable row level security;

drop policy if exists "request_items_select_by_request_access" on public.request_items;
create policy "request_items_select_by_request_access"
on public.request_items
for select
to authenticated
using (
  public.is_supervisor()
  or exists (
    select 1
    from public.requests r
    where r.id = request_items.request_id
      and (
        r.requester_id = auth.uid()
        or r.picker_id = auth.uid()
        or public.current_user_role() = 'surtidor'
      )
  )
);

drop policy if exists "request_items_insert_by_requester_or_supervisor" on public.request_items;
create policy "request_items_insert_by_requester_or_supervisor"
on public.request_items
for insert
to authenticated
with check (
  public.is_supervisor()
  or exists (
    select 1
    from public.requests r
    where r.id = request_items.request_id
      and r.requester_id = auth.uid()
      and r.status = 'pendiente'
  )
);

drop policy if exists "request_items_update_by_picker_or_supervisor" on public.request_items;
create policy "request_items_update_by_picker_or_supervisor"
on public.request_items
for update
to authenticated
using (
  public.is_supervisor()
  or exists (
    select 1
    from public.requests r
    where r.id = request_items.request_id
      and public.current_user_role() = 'surtidor'
  )
)
with check (
  public.is_supervisor()
  or exists (
    select 1
    from public.requests r
    where r.id = request_items.request_id
      and public.current_user_role() = 'surtidor'
  )
);

drop policy if exists "request_receipts_select_by_request_access" on public.request_receipts;
create policy "request_receipts_select_by_request_access"
on public.request_receipts
for select
to authenticated
using (
  public.is_supervisor()
  or received_by = auth.uid()
  or delivered_by = auth.uid()
  or exists (
    select 1
    from public.requests r
    where r.id = request_receipts.request_id
      and (
        r.requester_id = auth.uid()
        or r.picker_id = auth.uid()
        or public.current_user_role() = 'surtidor'
      )
  )
);

create or replace function public.set_my_receipt_pin(pin text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Usuario no autenticado';
  end if;

  if pin is null or pin !~ '^[0-9]{4,8}$' then
    raise exception 'El NIP debe tener de 4 a 8 digitos';
  end if;

  update public.profiles
  set receipt_pin_hash = crypt(pin, gen_salt('bf')),
      updated_at = now()
  where id = auth.uid();
end;
$$;

create or replace function public.create_request_with_items(
  p_priority public.request_priority,
  p_notes text,
  p_items jsonb
)
returns public.requests
language plpgsql
security definer
set search_path = public
as $$
declare
  created_request public.requests;
  item_count integer;
  total_quantity integer;
  first_item jsonb;
begin
  if auth.uid() is null then
    raise exception 'Usuario no autenticado';
  end if;

  if public.current_user_role() not in ('solicitante', 'supervisor') then
    raise exception 'Solo solicitantes o supervisores pueden crear pedidos';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Agrega al menos una pieza';
  end if;

  select count(*), coalesce(sum((item->>'quantity')::integer), 0)
  into item_count, total_quantity
  from jsonb_array_elements(p_items) as item
  where nullif(trim(item->>'partCode'), '') is not null
    and (item->>'quantity') ~ '^[0-9]+$'
    and (item->>'quantity')::integer > 0;

  if item_count <> jsonb_array_length(p_items) then
    raise exception 'Todos los productos requieren codigo y cantidad valida';
  end if;

  first_item := p_items->0;

  insert into public.requests (
    requester_id,
    part_code,
    part_description,
    quantity,
    priority,
    notes
  )
  values (
    auth.uid(),
    upper(trim(first_item->>'partCode')) ||
      case when jsonb_array_length(p_items) > 1
        then ' +' || (jsonb_array_length(p_items) - 1)::text
        else ''
      end,
    case when jsonb_array_length(p_items) > 1
      then jsonb_array_length(p_items)::text || ' productos'
      else nullif(trim(first_item->>'partDescription'), '')
    end,
    total_quantity,
    p_priority,
    nullif(trim(coalesce(p_notes, '')), '')
  )
  returning * into created_request;

  insert into public.request_items (
    request_id,
    part_code,
    part_description,
    quantity
  )
  select
    created_request.id,
    upper(trim(item->>'partCode')),
    nullif(trim(coalesce(item->>'partDescription', '')), ''),
    (item->>'quantity')::integer
  from jsonb_array_elements(p_items) as item;

  return created_request;
end;
$$;

create or replace function public.confirm_request_receipt(
  p_request_id uuid,
  p_pin text,
  p_comment text default null
)
returns public.requests
language plpgsql
security definer
set search_path = public
as $$
declare
  target_request public.requests;
  confirmed_quantity integer;
begin
  if auth.uid() is null then
    raise exception 'Usuario no autenticado';
  end if;

  select *
  into target_request
  from public.requests
  where id = p_request_id
  for update;

  if target_request.id is null then
    raise exception 'Pedido no encontrado';
  end if;

  if target_request.requester_id <> auth.uid() then
    raise exception 'Solo el solicitante puede confirmar la recepcion';
  end if;

  if target_request.status <> 'surtida' then
    raise exception 'Solo se pueden recibir pedidos surtidos';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.receipt_pin_hash is not null
      and p.receipt_pin_hash = crypt(p_pin, p.receipt_pin_hash)
  ) then
    raise exception 'NIP de recepcion incorrecto o no configurado';
  end if;

  select coalesce(sum(quantity), 0)
  into confirmed_quantity
  from public.request_items
  where request_id = p_request_id;

  update public.request_items
  set received_quantity = quantity
  where request_id = p_request_id;

  update public.requests
  set status = 'recibida',
      received_at = now()
  where id = p_request_id
  returning * into target_request;

  insert into public.request_receipts (
    request_id,
    received_by,
    delivered_by,
    method,
    confirmed_quantity,
    comment
  )
  values (
    p_request_id,
    auth.uid(),
    target_request.picker_id,
    'pin',
    confirmed_quantity,
    nullif(trim(coalesce(p_comment, '')), '')
  );

  insert into public.request_movements (
    request_id,
    user_id,
    action,
    previous_status,
    new_status,
    comment
  )
  values (
    p_request_id,
    auth.uid(),
    'receipt_confirmed_pin',
    'surtida',
    'recibida',
    coalesce(nullif(trim(coalesce(p_comment, '')), ''), 'Recepcion confirmada con NIP')
  );

  return target_request;
end;
$$;

create or replace function public.sync_request_item_quantities()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status and new.status = 'surtida' then
    update public.request_items
    set delivered_quantity = quantity
    where request_id = new.id;
  end if;

  if old.status is distinct from new.status and new.status in ('no_encontrada', 'cancelada') then
    update public.request_items
    set delivered_quantity = 0
    where request_id = new.id
      and delivered_quantity is null;
  end if;

  return new;
end;
$$;

drop trigger if exists requests_sync_item_quantities on public.requests;
create trigger requests_sync_item_quantities
after update of status on public.requests
for each row
execute function public.sync_request_item_quantities();

grant execute on function public.set_my_receipt_pin(text) to authenticated;
grant execute on function public.create_request_with_items(public.request_priority, text, jsonb) to authenticated;
grant execute on function public.confirm_request_receipt(uuid, text, text) to authenticated;
grant select, insert, update on public.request_items to authenticated;
grant select on public.request_receipts to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.request_items;
exception
  when duplicate_object then null;
end;
$$;

select pg_notify('pgrst', 'reload schema');
