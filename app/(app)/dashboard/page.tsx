import { formatDateTime } from "@/lib/format";
import { requirePageRole } from "@/lib/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { InviteForm } from "./_components/invite-form";

type InviteRecord = {
  id: string;
  patient_email: string;
  status: string;
  expires_at: string;
  created_at: string;
};

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  await requirePageRole(supabase, "physio", "/dashboard");

  const { data: invites } = await supabase
    .from("invites")
    .select("id, patient_email, status, expires_at, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  const typedInvites = (invites ?? []) as InviteRecord[];

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-10"
    >
      <header className="space-y-1">
        <div>
          <h1 className="text-balance text-2xl font-semibold text-foreground">Panel Fizjoterapeuty</h1>
          <p className="text-sm text-muted-foreground">Etap A: tworzenie i akceptacja zaproszen.</p>
        </div>
      </header>

      <InviteForm />

      <section className="space-y-3 rounded-2xl border border-blue-200 bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Ostatnie Zaproszenia</h2>

        {typedInvites.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak zaproszen.</p>
        ) : (
          <ul className="space-y-2">
            {typedInvites.map((invite) => (
              <li
                key={invite.id}
                className="rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm"
              >
                <p className="font-medium text-foreground">{invite.patient_email}</p>
                <p className="text-muted-foreground">
                  status: {invite.status} | wygasa: {formatDateTime(invite.expires_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
