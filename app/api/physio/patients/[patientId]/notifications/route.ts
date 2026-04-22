import { NextResponse, type NextRequest } from "next/server";
import { requireApiRole } from "@/lib/auth/roles";
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
    .select("id, patient_id, times, is_enabled, timezone, updated_at")
    .eq("physio_id", authResult.user.id)
    .eq("patient_id", patientId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const times = (data?.times ?? []).map((value: string) => value.slice(0, 5));

  return NextResponse.json(
    {
      schedule: data
        ? {
            ...data,
            times,
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
        times: validated.times,
        is_enabled: validated.isEnabled,
        timezone: "Europe/Warsaw",
      },
      { onConflict: "physio_id,patient_id" },
    )
    .select("id, patient_id, times, is_enabled, timezone, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      schedule: {
        ...data,
        times: (data.times ?? []).map((value: string) => value.slice(0, 5)),
      },
    },
    { status: 200 },
  );
}
