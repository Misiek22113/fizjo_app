import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isInviteExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

type PendingInvite = {
  token: string;
  expires_at: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  const email = body?.email ? normalizeEmail(body.email) : "";

  if (!email) {
    return NextResponse.json({ error: "Email pacjenta jest wymagany." }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: invites, error } = await supabaseAdmin
    .from("invites")
    .select("token, expires_at")
    .eq("patient_email", email)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    return NextResponse.json({ error: "Nie udalo sie sprawdzic zaproszenia." }, { status: 500 });
  }

  const activeInvite = ((invites ?? []) as PendingInvite[]).find(
    (invite) => !isInviteExpired(invite.expires_at),
  );

  if (!activeInvite) {
    return NextResponse.json({ eligible: false }, { status: 200 });
  }

  return NextResponse.json(
    {
      eligible: true,
      token: activeInvite.token,
    },
    { status: 200 },
  );
}
