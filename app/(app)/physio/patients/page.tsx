import { requirePageRole } from "@/lib/auth/roles";
import { formatDateTime } from "@/lib/format";
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
  const authState = await requirePageRole(supabase, "physio", "/physio/patients");
  const user = authState.user;

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
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-10"
    >
      <header className="space-y-1">
        <div>
          <h1 className="text-balance text-2xl font-semibold text-foreground">Pacjenci Fizjoterapeuty</h1>
          <p className="text-sm text-muted-foreground">Aktywne relacje i historia zaproszen.</p>
        </div>
      </header>

      <section className="space-y-3 rounded-2xl border border-blue-200 bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Relacje Pacjentow</h2>

        {typedMemberships.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak relacji pacjentow.</p>
        ) : (
          <ul className="space-y-2">
            {typedMemberships.map((membership) => {
              const patient = patientMap.get(membership.patient_id);
              const patientName = patient?.display_name || patient?.email || membership.patient_id;

              return (
                <li
                  key={membership.id}
                  className="rounded-lg border border-blue-100 bg-white px-4 py-3 text-sm"
                >
                  <p className="font-medium text-foreground">{patientName}</p>
                  <p className="text-muted-foreground">status: {membership.status}</p>
                  <p className="text-muted-foreground">dolaczenie: {formatDateTime(membership.created_at)}</p>
                  {membership.unsubscribed_at ? (
                    <p className="text-muted-foreground">wypisanie: {formatDateTime(membership.unsubscribed_at)}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-blue-200 bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Historia Zaproszen</h2>

        {typedInvites.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak zaproszen.</p>
        ) : (
          <ul className="space-y-2">
            {typedInvites.map((invite) => (
              <li key={invite.id} className="rounded-lg border border-blue-100 bg-white px-4 py-3 text-sm">
                <p className="font-medium text-foreground">{invite.patient_email}</p>
                <p className="text-muted-foreground">status: {invite.status}</p>
                <p className="text-muted-foreground">utworzono: {formatDateTime(invite.created_at)}</p>
                <p className="text-muted-foreground">wygasa: {formatDateTime(invite.expires_at)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
