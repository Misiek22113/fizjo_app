import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizePhone(phone?: string): string | null {
  if (!phone) {
    return null;
  }

  const value = phone.trim();
  return value.length > 0 ? value : null;
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { email?: string; phone?: string };
  const patientEmail = body.email ? normalizeEmail(body.email) : "";
  const phone = normalizePhone(body.phone);

  if (!patientEmail) {
    return NextResponse.json(
      { error: "Email pacjenta jest wymagany." },
      { status: 400 },
    );
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("invites").insert({
    invited_by: user.id,
    patient_email: patientEmail,
    patient_phone: phone,
    token,
    expires_at: expiresAt,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const inviteUrl = new URL("/invite/accept", request.url);
  inviteUrl.searchParams.set("token", token);

  return NextResponse.json({ inviteUrl: inviteUrl.toString(), token }, { status: 201 });
}
