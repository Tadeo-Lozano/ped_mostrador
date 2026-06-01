-- Allow users to read profile names needed by visible requests.
-- This lets pickers see who requested a part without opening unrelated data.

drop policy if exists "profiles_select_own_or_supervisor" on public.profiles;
create policy "profiles_select_own_or_supervisor"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.is_supervisor()
  or exists (
    select 1
    from public.requests r
    where (
      r.requester_id = profiles.id
      or r.picker_id = profiles.id
    )
    and (
      r.requester_id = auth.uid()
      or r.picker_id = auth.uid()
      or public.current_user_role() = 'surtidor'
    )
  )
);
