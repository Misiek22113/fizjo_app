alter table public.profiles
add column if not exists phone text;

create table if not exists public.patient_notification_schedules (
  id uuid primary key default gen_random_uuid(),
  physio_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null references auth.users(id) on delete cascade,
  times time[] not null,
  is_enabled boolean not null default true,
  timezone text not null default 'Europe/Warsaw',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (physio_id, patient_id),
  check (array_length(times, 1) between 1 and 8)
);

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid references public.patient_notification_schedules(id) on delete set null,
  physio_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null references auth.users(id) on delete cascade,
  scheduled_date date not null,
  scheduled_time time not null,
  scheduled_timezone text not null default 'Europe/Warsaw',
  message_body text not null,
  message_sid text,
  status text not null default 'pending' check (status in ('pending', 'queued', 'sent', 'delivered', 'failed')),
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (physio_id, patient_id, scheduled_date, scheduled_time)
);

create unique index if not exists notification_deliveries_message_sid_uidx
on public.notification_deliveries(message_sid)
where message_sid is not null;

create index if not exists notification_schedules_physio_patient_idx
on public.patient_notification_schedules(physio_id, patient_id);

create index if not exists notification_deliveries_schedule_id_idx
on public.notification_deliveries(schedule_id);

create index if not exists notification_deliveries_status_idx
on public.notification_deliveries(status);

drop trigger if exists set_patient_notification_schedules_updated_at on public.patient_notification_schedules;
create trigger set_patient_notification_schedules_updated_at
before update on public.patient_notification_schedules
for each row execute function public.set_updated_at();

drop trigger if exists set_notification_deliveries_updated_at on public.notification_deliveries;
create trigger set_notification_deliveries_updated_at
before update on public.notification_deliveries
for each row execute function public.set_updated_at();

alter table public.patient_notification_schedules enable row level security;
alter table public.notification_deliveries enable row level security;

drop policy if exists "notification_schedules_select_physio" on public.patient_notification_schedules;
create policy "notification_schedules_select_physio"
on public.patient_notification_schedules
for select
to authenticated
using (
  physio_id = (select auth.uid())
  and exists (
    select 1
    from public.physio_patient_memberships m
    where m.physio_id = (select auth.uid())
      and m.patient_id = patient_notification_schedules.patient_id
      and m.status = 'active'
  )
);

drop policy if exists "notification_schedules_insert_physio" on public.patient_notification_schedules;
create policy "notification_schedules_insert_physio"
on public.patient_notification_schedules
for insert
to authenticated
with check (
  physio_id = (select auth.uid())
  and exists (
    select 1
    from public.physio_patient_memberships m
    where m.physio_id = (select auth.uid())
      and m.patient_id = patient_notification_schedules.patient_id
      and m.status = 'active'
  )
);

drop policy if exists "notification_schedules_update_physio" on public.patient_notification_schedules;
create policy "notification_schedules_update_physio"
on public.patient_notification_schedules
for update
to authenticated
using (
  physio_id = (select auth.uid())
  and exists (
    select 1
    from public.physio_patient_memberships m
    where m.physio_id = (select auth.uid())
      and m.patient_id = patient_notification_schedules.patient_id
      and m.status = 'active'
  )
)
with check (
  physio_id = (select auth.uid())
  and exists (
    select 1
    from public.physio_patient_memberships m
    where m.physio_id = (select auth.uid())
      and m.patient_id = patient_notification_schedules.patient_id
      and m.status = 'active'
  )
);

drop policy if exists "notification_deliveries_select_physio" on public.notification_deliveries;
create policy "notification_deliveries_select_physio"
on public.notification_deliveries
for select
to authenticated
using (physio_id = (select auth.uid()));

drop policy if exists "notification_deliveries_insert_physio" on public.notification_deliveries;
create policy "notification_deliveries_insert_physio"
on public.notification_deliveries
for insert
to authenticated
with check (physio_id = (select auth.uid()));

drop policy if exists "notification_deliveries_update_physio" on public.notification_deliveries;
create policy "notification_deliveries_update_physio"
on public.notification_deliveries
for update
to authenticated
using (physio_id = (select auth.uid()))
with check (physio_id = (select auth.uid()));

drop policy if exists "profiles_update_own_phone" on public.profiles;
create policy "profiles_update_own_phone"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);
