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
      <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-16">
        <section className="w-full space-y-3 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-zinc-900">Brak tokenu zaproszenia</h1>
          <p className="text-sm text-zinc-600">Link jest nieprawidlowy.</p>
          <Link href="/login" className="text-sm font-medium text-emerald-700">
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
    redirect(`/login?next=/invite/accept?token=${encodeURIComponent(token)}`);
  }

  const { data: invite, error } = await supabase
    .from("invites")
    .select("id, invited_by, patient_email, patient_phone, token, expires_at, status")
    .eq("token", token)
    .maybeSingle();

  if (error || !invite) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-16">
        <section className="w-full space-y-3 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-zinc-900">Zaproszenie nie istnieje</h1>
          <p className="text-sm text-zinc-600">Sprawdz, czy link jest poprawny.</p>
        </section>
      </main>
    );
  }

  const typedInvite = invite as Invite;

  if (typedInvite.status !== "pending") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-16">
        <section className="w-full space-y-3 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-zinc-900">To zaproszenie jest nieaktywne</h1>
          <p className="text-sm text-zinc-600">Status: {typedInvite.status}</p>
        </section>
      </main>
    );
  }

  if (isInviteExpired(typedInvite.expires_at)) {
    await supabase.from("invites").update({ status: "expired" }).eq("id", typedInvite.id);

    return (
      <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-16">
        <section className="w-full space-y-3 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-zinc-900">Zaproszenie wygaslo</h1>
          <p className="text-sm text-zinc-600">Popros fizjoterapeute o nowe zaproszenie.</p>
        </section>
      </main>
    );
  }

  if (user.email?.toLowerCase() !== typedInvite.patient_email.toLowerCase()) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-16">
        <section className="w-full space-y-3 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-zinc-900">To zaproszenie nie jest dla Ciebie</h1>
          <p className="text-sm text-zinc-600">
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
    },
    {
      onConflict: "id",
    },
  );

  if (profileError) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-16">
        <section className="w-full space-y-3 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-zinc-900">Nie udalo sie aktywowac konta</h1>
          <p className="text-sm text-zinc-600">{profileError.message}</p>
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
      <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-16">
        <section className="w-full space-y-3 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-zinc-900">Nie udalo sie utworzyc relacji</h1>
          <p className="text-sm text-zinc-600">{membershipError.message}</p>
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
      <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-16">
        <section className="w-full space-y-3 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-zinc-900">Nie udalo sie zapisac zgody</h1>
          <p className="text-sm text-zinc-600">{consentError.message}</p>
        </section>
      </main>
    );
  }

  await supabase.from("invites").update({ status: "accepted" }).eq("id", typedInvite.id);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-16">
      <section className="w-full space-y-3 rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">Zaproszenie zaakceptowane</h1>
        <p className="text-sm text-zinc-700">
          Twoje konto pacjenta zostalo podlaczone do fizjoterapeuty.
        </p>
        <Link href="/dashboard" className="text-sm font-medium text-emerald-700">
          Przejdz do dashboardu
        </Link>
      </section>
    </main>
  );
}
