-- Allow a supervisor/terminal account to confirm receipt using the requester's PIN.

alter table public.request_receipts
  add column if not exists confirmed_by uuid references public.profiles(id);

create index if not exists request_receipts_confirmed_by_created_at_idx
  on public.request_receipts(confirmed_by, created_at desc);

create or replace function public.confirm_request_receipt(
  p_request_id uuid,
  p_pin text,
  p_comment text default null
)
returns public.requests
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  target_request public.requests;
  confirmed_quantity integer;
  actor_role public.app_role;
begin
  if auth.uid() is null then
    raise exception 'Usuario no autenticado';
  end if;

  actor_role := public.current_user_role();

  select *
  into target_request
  from public.requests
  where id = p_request_id
  for update;

  if target_request.id is null then
    raise exception 'Pedido no encontrado';
  end if;

  if target_request.requester_id <> auth.uid() and actor_role <> 'supervisor' then
    raise exception 'Solo el solicitante o supervisor puede confirmar la recepcion';
  end if;

  if target_request.status <> 'surtida' then
    raise exception 'Solo se pueden recibir pedidos surtidos';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = target_request.requester_id
      and p.receipt_pin_hash is not null
      and p.receipt_pin_hash = extensions.crypt(p_pin, p.receipt_pin_hash)
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
    confirmed_by,
    method,
    confirmed_quantity,
    comment
  )
  values (
    p_request_id,
    target_request.requester_id,
    target_request.picker_id,
    auth.uid(),
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

grant execute on function public.confirm_request_receipt(uuid, text, text) to authenticated;

select pg_notify('pgrst', 'reload schema');
