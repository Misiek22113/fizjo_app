import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type UnsubscribeParams = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, { params }: UnsubscribeParams) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: membership, error: membershipFetchError } = await supabase
    .from("physio_patient_memberships")
    .select("id, physio_id, patient_id, status")
    .eq("id", id)
    .maybeSingle();

  if (membershipFetchError) {
    return NextResponse.json({ error: membershipFetchError.message }, { status: 500 });
  }

  if (!membership) {
    return NextResponse.json({ error: "Membership not found" }, { status: 404 });
  }

  if (membership.patient_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (membership.status === "unsubscribed") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const unsubscribedAt = new Date().toISOString();

  const { error: membershipUpdateError } = await supabase
    .from("physio_patient_memberships")
    .update({
      status: "unsubscribed",
      unsubscribed_at: unsubscribedAt,
    })
    .eq("id", id)
    .eq("patient_id", user.id);

  if (membershipUpdateError) {
    return NextResponse.json({ error: membershipUpdateError.message }, { status: 500 });
  }

  const { error: consentUpdateError } = await supabase
    .from("consents")
    .update({
      sms_opt_in: false,
      source: "patient_unsubscribe",
      granted_at: unsubscribedAt,
    })
    .eq("physio_id", membership.physio_id)
    .eq("patient_id", user.id);

  if (consentUpdateError) {
    return NextResponse.json({ error: consentUpdateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
