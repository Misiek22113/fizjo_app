import { NextResponse, type NextRequest } from "next/server";
import { requireApiRole } from "@/lib/auth/roles";
import { normalizePhoneToE164 } from "@/lib/phone";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const authResult = await requireApiRole(supabase, "patient");

  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const payload = (await request.json().catch(() => null)) as { phone?: string } | null;
  const rawPhone = payload?.phone ?? "";
  const normalizedPhone = normalizePhoneToE164(rawPhone);

  if (!normalizedPhone) {
    return NextResponse.json(
      { error: "Numer telefonu musi byc w formacie E.164, np. +48500100200." },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({ phone: normalizedPhone })
    .eq("id", authResult.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ phone: normalizedPhone }, { status: 200 });
}
