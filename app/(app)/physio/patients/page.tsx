import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Membership = {
  id: string;
  patient_id: string;
  status: "active" | "unsubscribed";
  created_at: string;
  unsubscribed_at: string | null;
};

type Invite = {
  id: string;
  patient_email: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  expires_at: string;
  created_at: string;
};

type PatientProfile = {
  id: string;
  email: string;
  display_name: string | null;
};

export default async function PhysioPatientsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/physio/patients");
  }

  const { data: memberships } = await supabase
    .from("physio_patient_memberships")
    .select("id, patient_id, status, created_at, unsubscribed_at")
    .eq("physio_id", user.id)
    .order("created_at", { ascending: false });

  const typedMemberships = (memberships ?? []) as Membership[];
  const patientIds = [...new Set(typedMemberships.map((membership) => membership.patient_id))];

  const patientMap = new Map<string, PatientProfile>();

  if (patientIds.length > 0) {
    const { data: patientProfiles } = await supabase
      .from("profiles")
      .select("id, email, display_name")
      .in("id", patientIds);

    (patientProfiles ?? []).forEach((profile) => {
      const typedProfile = profile as PatientProfile;
      patientMap.set(typedProfile.id, typedProfile);
    });
  }

  const { data: invites } = await supabase
    .from("invites")
    .select("id, patient_email, status, expires_at, created_at")
    .eq("invited_by", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const typedInvites = (invites ?? []) as Invite[];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Pacjenci fizjoterapeuty</h1>
          <p className="text-sm text-zinc-600">Aktywne relacje i historia zaproszen.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Dashboard
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Strona glowna
          </Link>
        </div>
      </header>

      <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Relacje pacjentow</h2>

        {typedMemberships.length === 0 ? (
          <p className="text-sm text-zinc-600">Brak relacji pacjentow.</p>
        ) : (
          <ul className="space-y-2">
            {typedMemberships.map((membership) => {
              const patient = patientMap.get(membership.patient_id);
              const patientName = patient?.display_name || patient?.email || membership.patient_id;

              return (
                <li
                  key={membership.id}
                  className="rounded-lg border border-zinc-200 px-4 py-3 text-sm"
                >
                  <p className="font-medium text-zinc-900">{patientName}</p>
                  <p className="text-zinc-600">status: {membership.status}</p>
                  <p className="text-zinc-600">
                    dolaczenie: {new Date(membership.created_at).toLocaleString()}
                  </p>
                  {membership.unsubscribed_at ? (
                    <p className="text-zinc-600">
                      wypisanie: {new Date(membership.unsubscribed_at).toLocaleString()}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Historia zaproszen</h2>

        {typedInvites.length === 0 ? (
          <p className="text-sm text-zinc-600">Brak zaproszen.</p>
        ) : (
          <ul className="space-y-2">
            {typedInvites.map((invite) => (
              <li key={invite.id} className="rounded-lg border border-zinc-200 px-4 py-3 text-sm">
                <p className="font-medium text-zinc-900">{invite.patient_email}</p>
                <p className="text-zinc-600">status: {invite.status}</p>
                <p className="text-zinc-600">utworzono: {new Date(invite.created_at).toLocaleString()}</p>
                <p className="text-zinc-600">wygasa: {new Date(invite.expires_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
