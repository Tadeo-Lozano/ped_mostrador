-- Initial Supabase/PostgreSQL schema for the internal warehouse request app.
-- Run this in the Supabase SQL editor or as migration 0001_initial_schema.sql.

create extension if not exists pgcrypto;

do $$
begin
  create type public.app_role as enum ('solicitante', 'surtidor', 'supervisor');
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.request_status as enum (
    'pendiente',
    'en_proceso',
    'surtida',
    'recibida',
    'no_encontrada',
    'cancelada'
  );
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.request_priority as enum ('normal', 'urgente', 'critica');
exception
  when duplicate_object then null;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'solicitante',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_not_empty check (length(trim(full_name)) > 0)
);

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  part_code text not null,
  part_description text,
  quantity integer not null,
  priority public.request_priority not null default 'normal',
  status public.request_status not null default 'pendiente',
  requester_id uuid not null references public.profiles(id),
  picker_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  delivered_at timestamptz,
  received_at timestamptz,
  notes text,
  constraint requests_part_code_not_empty check (length(trim(part_code)) > 0),
  constraint requests_quantity_positive check (quantity > 0),
  constraint requests_received_requires_surtida_time check (
    status <> 'recibida' or delivered_at is not null
  )
);

create table if not exists public.request_movements (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  action text not null,
  previous_status public.request_status,
  new_status public.request_status,
  comment text,
  created_at timestamptz not null default now(),
  constraint request_movements_action_not_empty check (length(trim(action)) > 0)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists requests_set_updated_at on public.requests;
create trigger requests_set_updated_at
before update on public.requests
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), new.email, 'Usuario sin nombre'),
    coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'solicitante')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
$$;

create or replace function public.is_supervisor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'supervisor'
$$;

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
    comment
  )
  values (
    new.id,
    new.requester_id,
    'created',
    null,
    new.status,
    new.notes
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

  actor_id := auth.uid();

  if actor_id is null then
    actor_id := coalesce(new.picker_id, new.requester_id);
  end if;

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

create index if not exists profiles_role_idx on public.profiles(role);

create index if not exists requests_status_created_at_idx
  on public.requests(status, created_at desc);

create index if not exists requests_priority_created_at_idx
  on public.requests(priority, created_at desc);

create index if not exists requests_requester_created_at_idx
  on public.requests(requester_id, created_at desc);

create index if not exists requests_picker_created_at_idx
  on public.requests(picker_id, created_at desc);

create index if not exists requests_part_code_idx
  on public.requests(part_code);

create index if not exists requests_part_code_lower_idx
  on public.requests(lower(part_code));

create index if not exists request_movements_request_created_at_idx
  on public.request_movements(request_id, created_at desc);

create index if not exists request_movements_user_created_at_idx
  on public.request_movements(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.requests enable row level security;
alter table public.request_movements enable row level security;

drop policy if exists "profiles_select_own_or_supervisor" on public.profiles;
create policy "profiles_select_own_or_supervisor"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.is_supervisor()
);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
);

drop policy if exists "profiles_update_own_name" on public.profiles;
create policy "profiles_update_own_name"
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
)
with check (
  id = auth.uid()
  and role = (select role from public.profiles where id = auth.uid())
);

drop policy if exists "profiles_supervisor_update" on public.profiles;
create policy "profiles_supervisor_update"
on public.profiles
for update
to authenticated
using (
  public.is_supervisor()
)
with check (
  public.is_supervisor()
);

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
  )
);

drop policy if exists "requests_insert_requester" on public.requests;
create policy "requests_insert_requester"
on public.requests
for insert
to authenticated
with check (
  requester_id = auth.uid()
  and status = 'pendiente'
  and picker_id is null
  and public.current_user_role() in ('solicitante', 'supervisor')
);

drop policy if exists "requests_update_requester_receive_or_cancel" on public.requests;
create policy "requests_update_requester_receive_or_cancel"
on public.requests
for update
to authenticated
using (
  requester_id = auth.uid()
)
with check (
  requester_id = auth.uid()
  and (
    status = 'recibida'
    or status = 'cancelada'
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
)
with check (
  public.current_user_role() = 'surtidor'
  and status in ('en_proceso', 'surtida', 'no_encontrada', 'cancelada')
  and (picker_id is null or picker_id = auth.uid())
);

drop policy if exists "requests_supervisor_all" on public.requests;
create policy "requests_supervisor_all"
on public.requests
for all
to authenticated
using (
  public.is_supervisor()
)
with check (
  public.is_supervisor()
);

drop policy if exists "request_movements_select_by_request_access" on public.request_movements;
create policy "request_movements_select_by_request_access"
on public.request_movements
for select
to authenticated
using (
  public.is_supervisor()
  or exists (
    select 1
    from public.requests r
    where r.id = request_movements.request_id
      and (
        r.requester_id = auth.uid()
        or r.picker_id = auth.uid()
        or public.current_user_role() = 'surtidor'
      )
  )
);

drop policy if exists "request_movements_insert_related_user" on public.request_movements;
create policy "request_movements_insert_related_user"
on public.request_movements
for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    public.is_supervisor()
    or exists (
      select 1
      from public.requests r
      where r.id = request_movements.request_id
        and (
          r.requester_id = auth.uid()
          or r.picker_id = auth.uid()
          or public.current_user_role() = 'surtidor'
        )
    )
  )
);

alter publication supabase_realtime add table public.requests;
alter publication supabase_realtime add table public.request_movements;

comment on table public.profiles is 'Application profile and business role for Supabase Auth users.';
comment on table public.requests is 'Part requests from warehouse 1 to warehouse 2.';
comment on table public.request_movements is 'Audit log for request lifecycle changes.';
