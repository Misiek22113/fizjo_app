import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-8 px-6 py-16">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold text-zinc-900">Fizjo App MVP</h1>
        <p className="max-w-2xl text-zinc-600">
          Testowa aplikacja do zarzadzania relacjami fizjoterapeuta-pacjent i zaproszeniami.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/login"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition hover:border-zinc-300"
        >
          Logowanie
        </Link>
        <Link
          href="/dashboard"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition hover:border-zinc-300"
        >
          Dashboard fizjo
        </Link>
        <Link
          href="/physio/patients"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition hover:border-zinc-300"
        >
          Lista pacjentow
        </Link>
        <Link
          href="/patient"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm transition hover:border-zinc-300"
        >
          Portal pacjenta
        </Link>
      </section>
    </main>
  );
}
