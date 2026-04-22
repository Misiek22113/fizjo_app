create table if not exists public.notification_test_sends (
  id uuid primary key default gen_random_uuid(),
  physio_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null references auth.users(id) on delete cascade,
  phone text not null,
  message_body text not null,
  message_sid text unique,
  status text not null default 'pending' check (status in ('pending', 'queued', 'sent', 'delivered', 'failed')),
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notification_test_sends_physio_id_idx
on public.notification_test_sends(physio_id);

create index if not exists notification_test_sends_patient_id_idx
on public.notification_test_sends(patient_id);

drop trigger if exists set_notification_test_sends_updated_at on public.notification_test_sends;
create trigger set_notification_test_sends_updated_at
before update on public.notification_test_sends
for each row execute function public.set_updated_at();

alter table public.notification_test_sends enable row level security;

drop policy if exists "notification_test_sends_select_physio" on public.notification_test_sends;
create policy "notification_test_sends_select_physio"
on public.notification_test_sends
for select
to authenticated
using (physio_id = (select auth.uid()));

drop policy if exists "notification_test_sends_insert_physio" on public.notification_test_sends;
create policy "notification_test_sends_insert_physio"
on public.notification_test_sends
for insert
to authenticated
with check (
  physio_id = (select auth.uid())
  and exists (
    select 1
    from public.physio_patient_memberships m
    where m.physio_id = (select auth.uid())
      and m.patient_id = notification_test_sends.patient_id
      and m.status = 'active'
  )
);

drop policy if exists "notification_test_sends_update_physio" on public.notification_test_sends;
create policy "notification_test_sends_update_physio"
on public.notification_test_sends
for update
to authenticated
using (physio_id = (select auth.uid()))
with check (physio_id = (select auth.uid()));
