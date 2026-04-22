import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyTwilioSignature } from "@/lib/twilio";

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
  const signature = request.headers.get("x-twilio-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Twilio signature." }, { status: 401 });
  }

  const body = await request.text();
  const verified = await verifyTwilioSignature({
    fullUrl: request.url,
    body,
    providedSignature: signature,
  });

  if (!verified) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const params = new URLSearchParams(body);
  const messageSid = params.get("MessageSid") || params.get("SmsSid");
  const messageStatus = params.get("MessageStatus") || params.get("SmsStatus");
  const errorCode = params.get("ErrorCode");
  const errorMessage = params.get("ErrorMessage");

  if (!messageSid || !messageStatus) {
    return NextResponse.json({ error: "Missing required Twilio fields." }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin
    .from("notification_deliveries")
    .update({
      status: mapTwilioStatus(messageStatus),
      error_code: errorCode,
      error_message: errorMessage,
    })
    .eq("message_sid", messageSid);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
