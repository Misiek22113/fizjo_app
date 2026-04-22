import { NextResponse, type NextRequest } from "next/server";
import { serverEnv } from "@/lib/env";
import { getCurrentDateInZone, getCurrentTimeInZone } from "@/lib/notification-schedule";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendTwilioSms } from "@/lib/twilio";

type ScheduleRecord = {
  id: string;
  physio_id: string;
  patient_id: string;
  times: string[];
  is_enabled: boolean;
  timezone: string;
};

type ConsentRecord = {
  sms_opt_in: boolean;
};

type ProfileRecord = {
  phone: string | null;
};

type DeliveryInsert = {
  schedule_id: string;
  physio_id: string;
  patient_id: string;
  scheduled_date: string;
  scheduled_time: string;
  scheduled_timezone: string;
  message_body: string;
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

export async function POST(request: NextRequest) {
  const requestSecret = request.headers.get("x-cron-secret");

  if (!requestSecret || requestSecret !== serverEnv.cronSharedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: schedules, error: schedulesError } = await supabaseAdmin
    .from("patient_notification_schedules")
    .select("id, physio_id, patient_id, times, is_enabled, timezone")
    .eq("is_enabled", true);

  if (schedulesError) {
    return NextResponse.json({ error: schedulesError.message }, { status: 500 });
  }

  const typedSchedules = (schedules ?? []) as ScheduleRecord[];
  const processed: Array<{ scheduleId: string; time: string; status: string }> = [];

  for (const schedule of typedSchedules) {
    const zone = schedule.timezone || "Europe/Warsaw";
    const today = getCurrentDateInZone(zone);
    const nowTime = getCurrentTimeInZone(zone);
    const dueTimes = (schedule.times ?? []).map((time) => time.slice(0, 5)).filter((time) => time <= nowTime);

    if (dueTimes.length === 0) {
      continue;
    }

    const { data: consent, error: consentError } = await supabaseAdmin
      .from("consents")
      .select("sms_opt_in")
      .eq("physio_id", schedule.physio_id)
      .eq("patient_id", schedule.patient_id)
      .maybeSingle();

    if (consentError) {
      processed.push({ scheduleId: schedule.id, time: "-", status: `consent_error:${consentError.message}` });
      continue;
    }

    const typedConsent = consent as ConsentRecord | null;

    if (!typedConsent?.sms_opt_in) {
      for (const time of dueTimes) {
        processed.push({ scheduleId: schedule.id, time, status: "skipped_opt_out" });
      }
      continue;
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("phone")
      .eq("id", schedule.patient_id)
      .maybeSingle();

    if (profileError) {
      processed.push({ scheduleId: schedule.id, time: "-", status: `profile_error:${profileError.message}` });
      continue;
    }

    const typedProfile = profile as ProfileRecord | null;

    if (!typedProfile?.phone) {
      for (const time of dueTimes) {
        await supabaseAdmin.from("notification_deliveries").upsert(
          {
            schedule_id: schedule.id,
            physio_id: schedule.physio_id,
            patient_id: schedule.patient_id,
            scheduled_date: today,
            scheduled_time: time,
            scheduled_timezone: zone,
            message_body: "Przypomnienie o cwiczeniach od fizjoterapeuty.",
            status: "failed",
            error_message: "Brak numeru telefonu pacjenta.",
          } satisfies DeliveryInsert & { status: string; error_message: string },
          { onConflict: "physio_id,patient_id,scheduled_date,scheduled_time" },
        );
        processed.push({ scheduleId: schedule.id, time, status: "failed_missing_phone" });
      }
      continue;
    }

    for (const time of dueTimes) {
      const messageBody = `To przypomnienie od Twojego fizjoterapeuty. Zaplanowana godzina: ${time}.`;
      const upsertPayload: DeliveryInsert = {
        schedule_id: schedule.id,
        physio_id: schedule.physio_id,
        patient_id: schedule.patient_id,
        scheduled_date: today,
        scheduled_time: time,
        scheduled_timezone: zone,
        message_body: messageBody,
      };

      const { data: inserted, error: insertError } = await supabaseAdmin
        .from("notification_deliveries")
        .upsert(upsertPayload, { onConflict: "physio_id,patient_id,scheduled_date,scheduled_time" })
        .select("id, message_sid, status")
        .single();

      if (insertError) {
        processed.push({ scheduleId: schedule.id, time, status: `insert_error:${insertError.message}` });
        continue;
      }

      const alreadySent = inserted.message_sid && ["queued", "sent", "delivered"].includes(inserted.status);

      if (alreadySent) {
        processed.push({ scheduleId: schedule.id, time, status: "already_sent" });
        continue;
      }

      try {
        const callbackUrl = `${serverEnv.appBaseUrl}/api/twilio/status`;
        const twilioResponse = await sendTwilioSms({
          to: typedProfile.phone,
          body: messageBody,
          statusCallbackUrl: callbackUrl,
        });

        await supabaseAdmin
          .from("notification_deliveries")
          .update({
            message_sid: twilioResponse.sid,
            status: mapTwilioStatus(twilioResponse.status),
            error_code: twilioResponse.error_code,
            error_message: twilioResponse.error_message,
          })
          .eq("id", inserted.id);

        processed.push({ scheduleId: schedule.id, time, status: `sent:${twilioResponse.status}` });
      } catch (error) {
        await supabaseAdmin
          .from("notification_deliveries")
          .update({
            status: "failed",
            error_message: error instanceof Error ? error.message : "Twilio send failed.",
          })
          .eq("id", inserted.id);

        processed.push({ scheduleId: schedule.id, time, status: "failed_send" });
      }
    }
  }

  return NextResponse.json({ processed }, { status: 200 });
}
