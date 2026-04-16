import Link from "next/link";
import { redirect } from "next/navigation";
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.email) {
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        role: "physio",
        email: user.email,
      },
      {
        onConflict: "id",
      },
    );
  }

  const { data: invites } = await supabase
    .from("invites")
    .select("id, patient_email, status, expires_at, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  const typedInvites = (invites ?? []) as InviteRecord[];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Panel fizjoterapeuty</h1>
          <p className="text-sm text-zinc-600">Etap A: tworzenie i akceptacja zaproszen.</p>
        </div>
        <Link
          href="/"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          Strona glowna
        </Link>
      </header>

      <InviteForm />

      <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Ostatnie zaproszenia</h2>

        {typedInvites.length === 0 ? (
          <p className="text-sm text-zinc-600">Brak zaproszen.</p>
        ) : (
          <ul className="space-y-2">
            {typedInvites.map((invite) => (
              <li
                key={invite.id}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              >
                <p className="font-medium text-zinc-900">{invite.patient_email}</p>
                <p className="text-zinc-600">
                  status: {invite.status} | wygasa: {new Date(invite.expires_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
