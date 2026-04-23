alter table public.patient_notification_schedules
add column if not exists slots jsonb;

update public.patient_notification_schedules
set slots = coalesce(
  (
    select jsonb_agg(
      jsonb_build_object(
        'time', to_char(time_value, 'HH24:MI'),
        'days', '[1,2,3,4,5,6,7]'::jsonb
      )
      order by time_value
    )
    from unnest(times) as time_value
  ),
  '[]'::jsonb
)
where slots is null or jsonb_typeof(slots) <> 'array';

alter table public.patient_notification_schedules
alter column slots set default '[]'::jsonb;

alter table public.patient_notification_schedules
alter column slots set not null;

alter table public.patient_notification_schedules
drop constraint if exists patient_notification_schedules_slots_max_two;

alter table public.patient_notification_schedules
add constraint patient_notification_schedules_slots_max_two
check (jsonb_typeof(slots) = 'array' and jsonb_array_length(slots) between 1 and 2);
