-- Repair audit movement triggers and backfill existing requests.

create or replace function public.log_request_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.request_movements (
    request_id,
    user_id,
    action,
    previous_status,
    new_status,
    comment,
    created_at
  )
  values (
    new.id,
    new.requester_id,
    'created',
    null,
    new.status,
    new.notes,
    new.created_at
  );

  return new;
end;
$$;

drop trigger if exists requests_log_insert on public.requests;
create trigger requests_log_insert
after insert on public.requests
for each row
execute function public.log_request_insert();

create or replace function public.log_request_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid;
  movement_action text;
begin
  if old.status is not distinct from new.status then
    return new;
  end if;

  actor_id := coalesce(auth.uid(), new.picker_id, old.picker_id, new.requester_id);

  movement_action := case new.status
    when 'en_proceso' then 'started'
    when 'surtida' then 'delivered'
    when 'recibida' then 'received'
    when 'no_encontrada' then 'not_found'
    when 'cancelada' then 'cancelled'
    else 'status_changed'
  end;

  insert into public.request_movements (
    request_id,
    user_id,
    action,
    previous_status,
    new_status,
    comment
  )
  values (
    new.id,
    actor_id,
    movement_action,
    old.status,
    new.status,
    new.notes
  );

  return new;
end;
$$;

drop trigger if exists requests_log_status_change on public.requests;
create trigger requests_log_status_change
after update of status on public.requests
for each row
execute function public.log_request_status_change();

insert into public.request_movements (
  request_id,
  user_id,
  action,
  previous_status,
  new_status,
  comment,
  created_at
)
select
  r.id,
  r.requester_id,
  'created',
  null,
  'pendiente',
  r.notes,
  r.created_at
from public.requests r
where not exists (
  select 1
  from public.request_movements rm
  where rm.request_id = r.id
    and rm.action = 'created'
);

insert into public.request_movements (
  request_id,
  user_id,
  action,
  previous_status,
  new_status,
  comment,
  created_at
)
select
  r.id,
  coalesce(r.picker_id, r.requester_id),
  case r.status
    when 'en_proceso' then 'started'
    when 'surtida' then 'delivered'
    when 'recibida' then 'received'
    when 'no_encontrada' then 'not_found'
    when 'cancelada' then 'cancelled'
    else 'status_changed'
  end,
  'pendiente',
  r.status,
  coalesce(r.notes, 'Movimiento reconstruido desde el estado actual.'),
  coalesce(r.received_at, r.delivered_at, r.updated_at, r.created_at)
from public.requests r
where r.status <> 'pendiente'
  and not exists (
    select 1
    from public.request_movements rm
    where rm.request_id = r.id
      and rm.new_status = r.status
      and rm.action <> 'created'
  );
