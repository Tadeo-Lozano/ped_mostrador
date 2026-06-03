-- Fix receipt PIN functions when pgcrypto is installed in Supabase's extensions schema.

create or replace function public.set_my_receipt_pin(pin text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if auth.uid() is null then
    raise exception 'Usuario no autenticado';
  end if;

  if pin is null or pin !~ '^[0-9]{4,8}$' then
    raise exception 'El NIP debe tener de 4 a 8 digitos';
  end if;

  update public.profiles
  set receipt_pin_hash = extensions.crypt(pin, extensions.gen_salt('bf')),
      updated_at = now()
  where id = auth.uid();
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
set search_path = public, extensions
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

grant execute on function public.set_my_receipt_pin(text) to authenticated;
grant execute on function public.confirm_request_receipt(uuid, text, text) to authenticated;

select pg_notify('pgrst', 'reload schema');
