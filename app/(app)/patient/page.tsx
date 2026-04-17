import Link from "next/link";
import { requirePageRole } from "@/lib/auth/roles";
import { formatDateTime } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UnsubscribeButton } from "./_components/unsubscribe-button";

type PatientMembership = {
  id: string;
  physio_id: string;
  status: "active" | "unsubscribed";
  created_at: string;
  unsubscribed_at: string | null;
};

type PhysioProfile = {
  id: string;
  email: string;
  display_name: string | null;
};

export default async function PatientPortalPage() {
  const supabase = await createSupabaseServerClient();
  const authState = await requirePageRole(supabase, "patient", "/patient");
  const user = authState.user;

  const { data: memberships } = await supabase
    .from("physio_patient_memberships")
    .select("id, physio_id, status, created_at, unsubscribed_at")
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false });

  const typedMemberships = (memberships ?? []) as PatientMembership[];
  const physioIds = [...new Set(typedMemberships.map((membership) => membership.physio_id))];

  const physioMap = new Map<string, PhysioProfile>();

  if (physioIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, display_name")
      .in("id", physioIds);

    (profiles ?? []).forEach((profile) => {
      const typedProfile = profile as PhysioProfile;
      physioMap.set(typedProfile.id, typedProfile);
    });
  }

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-balance text-2xl font-semibold text-foreground">Portal Pacjenta</h1>
          <p className="text-sm text-muted-foreground">Sprawdz, do jakich fizjoterapeutow jestes przypisany.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard"
            className="rounded-lg border border-blue-200 bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            Dashboard
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-blue-200 bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            Strona glowna
          </Link>
        </div>
      </header>

      <section className="space-y-3 rounded-2xl border border-blue-200 bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Twoje Relacje</h2>

        {typedMemberships.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nie masz jeszcze aktywnych relacji.</p>
        ) : (
          <ul className="space-y-2">
            {typedMemberships.map((membership) => {
              const physio = physioMap.get(membership.physio_id);
              const physioName = physio?.display_name || physio?.email || membership.physio_id;

              return (
                <li
                  key={membership.id}
                  className="flex flex-col gap-3 rounded-lg border border-blue-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-foreground">{physioName}</p>
                    <p className="text-muted-foreground">status: {membership.status}</p>
                    <p className="text-muted-foreground">dolaczenie: {formatDateTime(membership.created_at)}</p>
                    {membership.unsubscribed_at ? (
                      <p className="text-muted-foreground">wypisanie: {formatDateTime(membership.unsubscribed_at)}</p>
                    ) : null}
                  </div>

                  <UnsubscribeButton
                    membershipId={membership.id}
                    disabled={membership.status !== "active"}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
