import Link from "next/link";
import { InviteAuthForm } from "./_components/invite-auth-form";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type InviteStatus = "pending" | "accepted" | "expired" | "cancelled";

type InviteRecord = {
  id: string;
  patient_email: string;
  expires_at: string;
  status: InviteStatus;
};

type InviteAuthPageProps = {
  searchParams: Promise<{ token?: string }>;
};

function isInviteExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

export default async function InviteAuthPage({ searchParams }: InviteAuthPageProps) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <main
        id="main-content"
        className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-16"
      >
        <section className="w-full space-y-3 rounded-2xl border border-blue-200 bg-surface p-8 shadow-sm">
          <h1 className="text-balance text-xl font-semibold text-foreground">Brak Tokenu Zaproszenia</h1>
          <p className="text-sm text-muted-foreground">Nie moge rozpoczac rejestracji bez linku zaproszenia.</p>
          <Link href="/login/patient" className="text-sm font-medium text-blue-700 hover:text-blue-800">
            Przejdz do logowania pacjenta
          </Link>
        </section>
      </main>
    );
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: invite, error } = await supabaseAdmin
    .from("invites")
    .select("id, patient_email, expires_at, status")
    .eq("token", token)
    .maybeSingle();

  if (error || !invite) {
    return (
      <main
        id="main-content"
        className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-16"
      >
        <section className="w-full space-y-3 rounded-2xl border border-blue-200 bg-surface p-8 shadow-sm">
          <h1 className="text-balance text-xl font-semibold text-foreground">Zaproszenie Nie Istnieje</h1>
          <p className="text-sm text-muted-foreground">Sprawdz, czy link jest poprawny.</p>
        </section>
      </main>
    );
  }

  const typedInvite = invite as InviteRecord;

  if (typedInvite.status !== "pending" || isInviteExpired(typedInvite.expires_at)) {
    return (
      <main
        id="main-content"
        className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-16"
      >
        <section className="w-full space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
          <h1 className="text-balance text-xl font-semibold text-amber-900">To Zaproszenie Jest Nieaktywne</h1>
          <p className="text-sm text-amber-800">Status: {typedInvite.status}</p>
        </section>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-16"
    >
      <section className="w-full space-y-6 rounded-2xl border border-blue-200 bg-surface p-8 shadow-sm">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Zaproszenie Pacjenta</p>
          <h1 className="text-balance text-2xl font-semibold text-foreground">
            Rejestracja lub logowanie pacjenta
          </h1>
          <p className="text-sm text-muted-foreground">
            Dla tego zaproszenia uzyj dokladnie adresu {typedInvite.patient_email}.
          </p>
        </header>

        <InviteAuthForm token={token} invitedEmail={typedInvite.patient_email} />
      </section>
    </main>
  );
}
