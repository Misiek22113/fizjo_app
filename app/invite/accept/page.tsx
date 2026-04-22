import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type InviteStatus = "pending" | "accepted" | "expired" | "cancelled";

type Invite = {
  id: string;
  invited_by: string;
  patient_email: string;
  patient_phone: string | null;
  token: string;
  expires_at: string;
  status: InviteStatus;
};

type AcceptInviteProps = {
  searchParams: Promise<{ token?: string }>;
};

function isInviteExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

export default async function AcceptInvitePage({
  searchParams,
}: AcceptInviteProps) {
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
          <p className="text-sm text-muted-foreground">Link jest nieprawidlowy.</p>
          <Link href="/login/patient" className="text-sm font-medium text-blue-700 hover:text-blue-800">
            Przejdz do logowania
          </Link>
        </section>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/invite/auth?token=${encodeURIComponent(token)}`);
  }

  const { data: invite, error } = await supabase
    .from("invites")
    .select("id, invited_by, patient_email, patient_phone, token, expires_at, status")
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

  const typedInvite = invite as Invite;

  if (typedInvite.status !== "pending") {
    return (
      <main
        id="main-content"
        className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-16"
      >
        <section className="w-full space-y-3 rounded-2xl border border-blue-200 bg-surface p-8 shadow-sm">
          <h1 className="text-balance text-xl font-semibold text-foreground">To Zaproszenie Jest Nieaktywne</h1>
          <p className="text-sm text-muted-foreground">Status: {typedInvite.status}</p>
        </section>
      </main>
    );
  }

  if (isInviteExpired(typedInvite.expires_at)) {
    await supabase.from("invites").update({ status: "expired" }).eq("id", typedInvite.id);

    return (
      <main
        id="main-content"
        className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-16"
      >
        <section className="w-full space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
          <h1 className="text-balance text-xl font-semibold text-amber-900">Zaproszenie Wygaslo</h1>
          <p className="text-sm text-amber-800">Popros fizjoterapeute o nowe zaproszenie.</p>
        </section>
      </main>
    );
  }

  if (user.email?.toLowerCase() !== typedInvite.patient_email.toLowerCase()) {
    return (
      <main
        id="main-content"
        className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-16"
      >
        <section className="w-full space-y-3 rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm" aria-live="polite">
          <h1 className="text-balance text-xl font-semibold text-red-900">To Zaproszenie Nie Jest Dla Ciebie</h1>
          <p className="text-sm text-red-800">
            Zaloguj sie na konto pacjenta z adresem {typedInvite.patient_email}.
          </p>
        </section>
      </main>
    );
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      role: "patient",
      email: typedInvite.patient_email,
      phone: typedInvite.patient_phone,
    },
    {
      onConflict: "id",
    },
  );

  if (profileError) {
    return (
      <main
        id="main-content"
        className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-16"
      >
        <section className="w-full space-y-3 rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm" aria-live="polite">
          <h1 className="text-balance text-xl font-semibold text-red-900">Nie Udalo Sie Aktywowac Konta</h1>
          <p className="text-sm text-red-800">{profileError.message}</p>
        </section>
      </main>
    );
  }

  const { error: membershipError } = await supabase
    .from("physio_patient_memberships")
    .upsert(
      {
        physio_id: typedInvite.invited_by,
        patient_id: user.id,
        status: "active",
      },
      {
        onConflict: "physio_id,patient_id",
      },
    );

  if (membershipError) {
    return (
      <main
        id="main-content"
        className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-16"
      >
        <section className="w-full space-y-3 rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm" aria-live="polite">
          <h1 className="text-balance text-xl font-semibold text-red-900">Nie Udalo Sie Utworzyc Relacji</h1>
          <p className="text-sm text-red-800">{membershipError.message}</p>
        </section>
      </main>
    );
  }

  const { error: consentError } = await supabase.from("consents").upsert(
    {
      physio_id: typedInvite.invited_by,
      patient_id: user.id,
      sms_opt_in: true,
      source: "invite_accept",
      granted_at: new Date().toISOString(),
    },
    {
      onConflict: "physio_id,patient_id",
    },
  );

  if (consentError) {
    return (
      <main
        id="main-content"
        className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-16"
      >
        <section className="w-full space-y-3 rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm" aria-live="polite">
          <h1 className="text-balance text-xl font-semibold text-red-900">Nie Udalo Sie Zapisac Zgody</h1>
          <p className="text-sm text-red-800">{consentError.message}</p>
        </section>
      </main>
    );
  }

  await supabase.from("invites").update({ status: "accepted" }).eq("id", typedInvite.id);

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-16"
    >
      <section className="w-full space-y-3 rounded-2xl border border-blue-200 bg-blue-50 p-8 shadow-sm" aria-live="polite">
        <h1 className="text-balance text-xl font-semibold text-blue-900">Zaproszenie Zaakceptowane</h1>
        <p className="text-sm text-blue-800">
          Twoje konto pacjenta zostalo podlaczone do fizjoterapeuty.
        </p>
        <Link href="/patient" className="text-sm font-medium text-blue-700 hover:text-blue-800">
          Przejdz do portalu pacjenta
        </Link>
      </section>
    </main>
  );
}
