import { NextResponse, type NextRequest } from "next/server";
import { requireApiRole } from "@/lib/auth/roles";
import type { ScheduleSlot } from "@/lib/notification-schedule";
import { validateSchedulePayload } from "@/lib/notification-schedule";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteParams = {
  params: Promise<{ patientId: string }>;
};

async function hasActiveMembership(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, physioId: string, patientId: string) {
  const { data, error } = await supabase
    .from("physio_patient_memberships")
    .select("id")
    .eq("physio_id", physioId)
    .eq("patient_id", patientId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    return { ok: false as const, status: 500, error: error.message };
  }

  if (!data) {
    return { ok: false as const, status: 403, error: "Brak aktywnej relacji z pacjentem." };
  }

  return { ok: true as const };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { patientId } = await params;
  const supabase = await createSupabaseServerClient();

  const authResult = await requireApiRole(supabase, "physio");

  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const membershipResult = await hasActiveMembership(supabase, authResult.user.id, patientId);

  if (!membershipResult.ok) {
    return NextResponse.json({ error: membershipResult.error }, { status: membershipResult.status });
  }

  const { data, error } = await supabase
    .from("patient_notification_schedules")
    .select("id, patient_id, slots, times, is_enabled, timezone, updated_at")
    .eq("physio_id", authResult.user.id)
    .eq("patient_id", patientId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const normalizedSlots = ((data?.slots ?? []) as ScheduleSlot[])
    .map((slot) => ({
      time: slot.time?.slice(0, 5),
      days: Array.isArray(slot.days) ? slot.days : [],
    }))
    .filter((slot) => typeof slot.time === "string" && slot.time.length === 5 && slot.days.length > 0);

  const fallbackSlots = (data?.times ?? []).map((value: string) => ({
    time: value.slice(0, 5),
    days: [1, 2, 3, 4, 5, 6, 7],
  }));

  const slots = normalizedSlots.length > 0 ? normalizedSlots : fallbackSlots;

  return NextResponse.json(
    {
      schedule: data
        ? {
            ...data,
            slots,
          }
        : null,
      defaults: {
        timezone: "Europe/Warsaw",
      },
    },
    { status: 200 },
  );
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { patientId } = await params;
  const supabase = await createSupabaseServerClient();

  const authResult = await requireApiRole(supabase, "physio");

  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const membershipResult = await hasActiveMembership(supabase, authResult.user.id, patientId);

  if (!membershipResult.ok) {
    return NextResponse.json({ error: membershipResult.error }, { status: membershipResult.status });
  }

  const payload = await request.json().catch(() => null);
  const validated = validateSchedulePayload(payload);

  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("patient_notification_schedules")
    .upsert(
      {
        physio_id: authResult.user.id,
        patient_id: patientId,
        slots: validated.slots,
        times: validated.slots.map((slot) => slot.time),
        is_enabled: validated.isEnabled,
        timezone: "Europe/Warsaw",
      },
      { onConflict: "physio_id,patient_id" },
    )
    .select("id, patient_id, slots, times, is_enabled, timezone, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      schedule: {
        ...data,
        slots: (data.slots ?? []).map((slot: ScheduleSlot) => ({
          time: slot.time.slice(0, 5),
          days: slot.days,
        })),
      },
    },
    { status: 200 },
  );
}
