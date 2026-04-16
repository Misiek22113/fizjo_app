import Link from "next/link";
import { redirect } from "next/navigation";
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/patient");
  }

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
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Portal pacjenta</h1>
          <p className="text-sm text-zinc-600">Sprawdz, do jakich fizjoterapeutow jestes przypisany.</p>
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
        <h2 className="text-lg font-semibold text-zinc-900">Twoje relacje</h2>

        {typedMemberships.length === 0 ? (
          <p className="text-sm text-zinc-600">Nie masz jeszcze aktywnych relacji.</p>
        ) : (
          <ul className="space-y-2">
            {typedMemberships.map((membership) => {
              const physio = physioMap.get(membership.physio_id);
              const physioName = physio?.display_name || physio?.email || membership.physio_id;

              return (
                <li
                  key={membership.id}
                  className="flex flex-col gap-3 rounded-lg border border-zinc-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-zinc-900">{physioName}</p>
                    <p className="text-zinc-600">status: {membership.status}</p>
                    <p className="text-zinc-600">
                      dolaczenie: {new Date(membership.created_at).toLocaleString()}
                    </p>
                    {membership.unsubscribed_at ? (
                      <p className="text-zinc-600">
                        wypisanie: {new Date(membership.unsubscribed_at).toLocaleString()}
                      </p>
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
