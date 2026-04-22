drop policy if exists "profiles_select_own" on public.profiles;

create policy "profiles_select_related"
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) = id
  or exists (
    select 1
    from public.physio_patient_memberships m
    where m.status = 'active'
      and (
        (m.physio_id = (select auth.uid()) and m.patient_id = profiles.id)
        or (m.patient_id = (select auth.uid()) and m.physio_id = profiles.id)
      )
  )
);
