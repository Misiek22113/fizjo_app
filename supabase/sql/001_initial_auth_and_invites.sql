create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('physio', 'patient')),
  email text not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  invited_by uuid not null references auth.users(id) on delete cascade,
  patient_email text not null,
  patient_phone text,
  token text not null unique,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.physio_patient_memberships (
  id uuid primary key default gen_random_uuid(),
  physio_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (physio_id, patient_id)
);

create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  physio_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null references auth.users(id) on delete cascade,
  sms_opt_in boolean not null default true,
  source text not null,
  granted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (physio_id, patient_id)
);

create index if not exists invites_invited_by_idx on public.invites(invited_by);
create index if not exists invites_patient_email_idx on public.invites(lower(patient_email));
create index if not exists invites_status_idx on public.invites(status);
create index if not exists invites_expires_at_idx on public.invites(expires_at);

create index if not exists memberships_physio_id_idx on public.physio_patient_memberships(physio_id);
create index if not exists memberships_patient_id_idx on public.physio_patient_memberships(patient_id);

create index if not exists consents_physio_id_idx on public.consents(physio_id);
create index if not exists consents_patient_id_idx on public.consents(patient_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_invites_updated_at on public.invites;
create trigger set_invites_updated_at
before update on public.invites
for each row execute function public.set_updated_at();

drop trigger if exists set_memberships_updated_at on public.physio_patient_memberships;
create trigger set_memberships_updated_at
before update on public.physio_patient_memberships
for each row execute function public.set_updated_at();

drop trigger if exists set_consents_updated_at on public.consents;
create trigger set_consents_updated_at
before update on public.consents
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.invites enable row level security;
alter table public.physio_patient_memberships enable row level security;
alter table public.consents enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "invites_select_related" on public.invites;
create policy "invites_select_related"
on public.invites
for select
using (
  invited_by = auth.uid()
  or lower(patient_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "invites_insert_owner" on public.invites;
create policy "invites_insert_owner"
on public.invites
for insert
with check (invited_by = auth.uid());

drop policy if exists "invites_update_related" on public.invites;
create policy "invites_update_related"
on public.invites
for update
using (
  invited_by = auth.uid()
  or lower(patient_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
)
with check (
  invited_by = auth.uid()
  or lower(patient_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "memberships_select_related" on public.physio_patient_memberships;
create policy "memberships_select_related"
on public.physio_patient_memberships
for select
using (physio_id = auth.uid() or patient_id = auth.uid());

drop policy if exists "memberships_insert_related" on public.physio_patient_memberships;
create policy "memberships_insert_related"
on public.physio_patient_memberships
for insert
with check (physio_id = auth.uid() or patient_id = auth.uid());

drop policy if exists "memberships_update_related" on public.physio_patient_memberships;
create policy "memberships_update_related"
on public.physio_patient_memberships
for update
using (physio_id = auth.uid() or patient_id = auth.uid())
with check (physio_id = auth.uid() or patient_id = auth.uid());

drop policy if exists "consents_select_related" on public.consents;
create policy "consents_select_related"
on public.consents
for select
using (physio_id = auth.uid() or patient_id = auth.uid());

drop policy if exists "consents_insert_related" on public.consents;
create policy "consents_insert_related"
on public.consents
for insert
with check (physio_id = auth.uid() or patient_id = auth.uid());

drop policy if exists "consents_update_related" on public.consents;
create policy "consents_update_related"
on public.consents
for update
using (physio_id = auth.uid() or patient_id = auth.uid())
with check (physio_id = auth.uid() or patient_id = auth.uid());
