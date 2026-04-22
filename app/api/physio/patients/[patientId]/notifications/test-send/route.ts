import { NextResponse, type NextRequest } from "next/server";
import { requireApiRole } from "@/lib/auth/roles";
import { serverEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendTwilioSms } from "@/lib/twilio";

type RouteParams = {
  params: Promise<{ patientId: string }>;
};

function mapTwilioStatus(status: string): "queued" | "sent" | "delivered" | "failed" {
  if (status === "queued") {
    return "queued";
  }

  if (status === "sent") {
    return "sent";
  }

  if (status === "delivered") {
    return "delivered";
  }

  return "failed";
}

function getWarsawDateTimeParts() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    date: `${map.year}-${map.month}-${map.day}`,
    time: `${map.hour}:${map.minute}:${map.second}`,
    shortTime: `${map.hour}:${map.minute}`,
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { patientId } = await params;
  const supabase = await createSupabaseServerClient();

  const authResult = await requireApiRole(supabase, "physio");

  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { data: membership, error: membershipError } = await supabase
    .from("physio_patient_memberships")
    .select("id")
    .eq("physio_id", authResult.user.id)
    .eq("patient_id", patientId)
    .eq("status", "active")
    .maybeSingle();

  if (membershipError) {
    return NextResponse.json({ error: membershipError.message }, { status: 500 });
  }

  if (!membership) {
    return NextResponse.json({ error: "Brak aktywnej relacji z pacjentem." }, { status: 403 });
  }

  const { data: consent, error: consentError } = await supabase
    .from("consents")
    .select("sms_opt_in")
    .eq("physio_id", authResult.user.id)
    .eq("patient_id", patientId)
    .maybeSingle();

  if (consentError) {
    return NextResponse.json({ error: consentError.message }, { status: 500 });
  }

  if (!consent?.sms_opt_in) {
    return NextResponse.json(
      { error: "Pacjent nie ma aktywnej zgody SMS (sms_opt_in = false)." },
      { status: 400 },
    );
  }

  const { data: patientProfile, error: profileError } = await supabase
    .from("profiles")
    .select("phone")
    .eq("id", patientId)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (!patientProfile?.phone) {
    return NextResponse.json({ error: "Pacjent nie ma ustawionego numeru telefonu." }, { status: 400 });
  }

  const now = getWarsawDateTimeParts();
  const payload = (await request.json().catch(() => null)) as { message?: string } | null;
  const customMessage = payload?.message?.trim();
  const messageBody =
    customMessage && customMessage.length > 0
      ? customMessage
      : `TEST: przypomnienie od fizjoterapeuty o ${now.shortTime}.`;

  const { data: delivery, error: deliveryError } = await supabase
    .from("notification_deliveries")
    .insert({
      schedule_id: null,
      physio_id: authResult.user.id,
      patient_id: patientId,
      scheduled_date: now.date,
      scheduled_time: now.time,
      scheduled_timezone: "Europe/Warsaw",
      message_body: messageBody,
      status: "pending",
    })
    .select("id")
    .single();

  if (deliveryError) {
    return NextResponse.json({ error: deliveryError.message }, { status: 500 });
  }

  try {
    const twilioResponse = await sendTwilioSms({
      to: patientProfile.phone,
      body: messageBody,
      statusCallbackUrl: `${serverEnv.appBaseUrl}/api/twilio/status`,
    });

    const mappedStatus = mapTwilioStatus(twilioResponse.status);

    await supabase
      .from("notification_deliveries")
      .update({
        message_sid: twilioResponse.sid,
        status: mappedStatus,
        error_code: twilioResponse.error_code,
        error_message: twilioResponse.error_message,
      })
      .eq("id", delivery.id);

    return NextResponse.json(
      {
        ok: true,
        messageSid: twilioResponse.sid,
        status: mappedStatus,
      },
      { status: 200 },
    );
  } catch (error) {
    await supabase
      .from("notification_deliveries")
      .update({
        status: "failed",
        error_message: error instanceof Error ? error.message : "Twilio send failed.",
      })
      .eq("id", delivery.id);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Nie udalo sie wyslac testowego SMS.",
      },
      { status: 500 },
    );
  }
}
