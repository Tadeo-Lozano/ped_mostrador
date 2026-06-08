-- Split operational requests by warehouse and capture picker employee number.

alter table public.profiles
  add column if not exists warehouse_location text;

alter table public.requests
  add column if not exists warehouse_location text,
  add column if not exists order_group_id uuid,
  add column if not exists picker_employee_number text;

alter table public.request_items
  add column if not exists warehouse_location text not null default 'arriba';

do $$
begin
  alter table public.profiles
    add constraint profiles_warehouse_location_valid
    check (warehouse_location is null or warehouse_location in ('arriba', 'abajo'));
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  alter table public.requests
    add constraint requests_warehouse_location_valid
    check (warehouse_location is null or warehouse_location in ('arriba', 'abajo'));
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  alter table public.request_items
    add constraint request_items_warehouse_location_valid
    check (warehouse_location in ('arriba', 'abajo'));
exception
  when duplicate_object then null;
end;
$$;

update public.requests
set warehouse_location = coalesce(warehouse_location, 'arriba'),
    order_group_id = coalesce(order_group_id, gen_random_uuid())
where warehouse_location is null
   or order_group_id is null;

update public.request_items ri
set warehouse_location = coalesce(r.warehouse_location, 'arriba')
from public.requests r
where r.id = ri.request_id
  and ri.warehouse_location is null;

create index if not exists profiles_role_warehouse_idx
  on public.profiles(role, warehouse_location);

create index if not exists requests_warehouse_status_created_at_idx
  on public.requests(warehouse_location, status, created_at desc);

create index if not exists requests_order_group_id_idx
  on public.requests(order_group_id);

create index if not exists request_items_warehouse_request_idx
  on public.request_items(warehouse_location, request_id);

create or replace function public.current_user_warehouse()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select warehouse_location
  from public.profiles
  where id = auth.uid()
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
  first_created_request public.requests;
  item_count integer;
  current_warehouse text;
  total_quantity integer;
  first_item jsonb;
  group_id uuid := gen_random_uuid();
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

  select count(*)
  into item_count
  from jsonb_array_elements(p_items) as item
  where nullif(trim(item->>'partCode'), '') is not null
    and (item->>'quantity') ~ '^[0-9]+$'
    and (item->>'quantity')::integer > 0
    and coalesce(item->>'warehouseLocation', '') in ('arriba', 'abajo');

  if item_count <> jsonb_array_length(p_items) then
    raise exception 'Todos los productos requieren codigo, cantidad valida y almacen';
  end if;

  for current_warehouse in
    select distinct item->>'warehouseLocation'
    from jsonb_array_elements(p_items) as item
    order by 1
  loop
    select coalesce(sum((item->>'quantity')::integer), 0)
    into total_quantity
    from jsonb_array_elements(p_items) as item
    where item->>'warehouseLocation' = current_warehouse;

    select item
    into first_item
    from jsonb_array_elements(p_items) as item
    where item->>'warehouseLocation' = current_warehouse
    limit 1;

    insert into public.requests (
      requester_id,
      part_code,
      part_description,
      quantity,
      priority,
      notes,
      warehouse_location,
      order_group_id
    )
    values (
      auth.uid(),
      upper(trim(first_item->>'partCode')) ||
        case when (
          select count(*)
          from jsonb_array_elements(p_items) as item
          where item->>'warehouseLocation' = current_warehouse
        ) > 1
          then ' +' || ((
            select count(*)
            from jsonb_array_elements(p_items) as item
            where item->>'warehouseLocation' = current_warehouse
          ) - 1)::text
          else ''
        end,
      case when (
        select count(*)
        from jsonb_array_elements(p_items) as item
        where item->>'warehouseLocation' = current_warehouse
      ) > 1
        then (
          select count(*)
          from jsonb_array_elements(p_items) as item
          where item->>'warehouseLocation' = current_warehouse
        )::text || ' productos - almacen ' || current_warehouse
        else nullif(trim(first_item->>'partDescription'), '')
      end,
      total_quantity,
      p_priority,
      nullif(trim(coalesce(p_notes, '')), ''),
      current_warehouse,
      group_id
    )
    returning * into created_request;

    insert into public.request_items (
      request_id,
      part_code,
      part_description,
      quantity,
      warehouse_location
    )
    select
      created_request.id,
      upper(trim(item->>'partCode')),
      nullif(trim(coalesce(item->>'partDescription', '')), ''),
      (item->>'quantity')::integer,
      item->>'warehouseLocation'
    from jsonb_array_elements(p_items) as item
    where item->>'warehouseLocation' = current_warehouse;

    if first_created_request.id is null then
      first_created_request := created_request;
    end if;
  end loop;

  return first_created_request;
end;
$$;

drop policy if exists "requests_select_by_role" on public.requests;
create policy "requests_select_by_role"
on public.requests
for select
to authenticated
using (
  public.is_supervisor()
  or requester_id = auth.uid()
  or (
    public.current_user_role() = 'surtidor'
    and status in ('pendiente', 'en_proceso', 'surtida', 'no_encontrada', 'cancelada')
    and (
      public.current_user_warehouse() is null
      or warehouse_location = public.current_user_warehouse()
    )
  )
);

drop policy if exists "requests_update_picker" on public.requests;
create policy "requests_update_picker"
on public.requests
for update
to authenticated
using (
  public.current_user_role() = 'surtidor'
  and status in ('pendiente', 'en_proceso', 'surtida')
  and (
    public.current_user_warehouse() is null
    or warehouse_location = public.current_user_warehouse()
  )
)
with check (
  public.current_user_role() = 'surtidor'
  and status in ('en_proceso', 'surtida', 'no_encontrada', 'cancelada')
  and (picker_id is null or picker_id = auth.uid())
  and (
    public.current_user_warehouse() is null
    or warehouse_location = public.current_user_warehouse()
  )
);

insert into public.profiles (id, full_name, role, warehouse_location)
select id, 'Almacen Arriba', 'surtidor', 'arriba'
from auth.users
where lower(email) = 'almacen.arriba@demo.com'
on conflict (id) do update
set full_name = excluded.full_name,
    role = excluded.role,
    warehouse_location = excluded.warehouse_location,
    updated_at = now();

insert into public.profiles (id, full_name, role, warehouse_location)
select id, 'Almacen Abajo', 'surtidor', 'abajo'
from auth.users
where lower(email) = 'almacen.abajo@demo.com'
on conflict (id) do update
set full_name = excluded.full_name,
    role = excluded.role,
    warehouse_location = excluded.warehouse_location,
    updated_at = now();

grant execute on function public.current_user_warehouse() to authenticated;
grant execute on function public.create_request_with_items(public.request_priority, text, jsonb) to authenticated;

select pg_notify('pgrst', 'reload schema');
