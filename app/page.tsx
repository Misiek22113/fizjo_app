import Link from "next/link";

export default function Home() {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-10 px-6 py-16"
    >
      <section className="space-y-4 text-center sm:text-left">
        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
          Testowe MVP
        </span>
        <h1 className="text-balance text-4xl font-semibold text-foreground sm:text-5xl">
          Fizjo App
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground sm:mx-0">
          Testowa aplikacja do zarzadzania relacjami fizjoterapeuta-pacjent i zaproszeniami.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/login"
          className="rounded-xl border border-blue-200 bg-surface px-4 py-3 text-sm font-medium text-foreground shadow-sm transition hover:border-blue-300 hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-blue-300"
        >
          Logowanie
        </Link>
        <Link
          href="/dashboard"
          className="rounded-xl border border-blue-200 bg-surface px-4 py-3 text-sm font-medium text-foreground shadow-sm transition hover:border-blue-300 hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-blue-300"
        >
          Dashboard fizjo
        </Link>
        <Link
          href="/physio/patients"
          className="rounded-xl border border-blue-200 bg-surface px-4 py-3 text-sm font-medium text-foreground shadow-sm transition hover:border-blue-300 hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-blue-300"
        >
          Lista pacjentow
        </Link>
        <Link
          href="/patient"
          className="rounded-xl border border-blue-200 bg-surface px-4 py-3 text-sm font-medium text-foreground shadow-sm transition hover:border-blue-300 hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-blue-300"
        >
          Portal pacjenta
        </Link>
      </section>
    </main>
  );
}
