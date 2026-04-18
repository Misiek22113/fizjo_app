import Link from "next/link";
import { PublicNavbar } from "../_components/public-navbar";

export default function AppHubPage() {
  return (
    <>
      <PublicNavbar />
      <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Centrum aplikacji</p>
          <h1 className="text-balance text-3xl font-semibold text-foreground md:text-5xl">Wybierz swoja strefe pracy</h1>
          <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
            Otworz obszar dopasowany do Twojej roli i kontynuuj swoj flow w kilka sekund.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="flex h-full flex-col rounded-2xl border border-blue-200 bg-surface p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Dla fizjoterapeutow</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">Zarzadzaj pacjentami i zaproszeniami</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Wysylaj zaproszenia, sprawdzaj statusy i przegladaj relacje z pacjentami.
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Link
                href="/login/physio"
                className="rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
              >
                Logowanie fizjoterapeuty
              </Link>
              <Link
                href="/dashboard"
                className="rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-foreground transition hover:bg-surface-muted"
              >
                Dashboard
              </Link>
              <Link
                href="/physio/patients"
                className="sm:col-span-2 rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-foreground transition hover:bg-surface-muted"
              >
                Lista pacjentow
              </Link>
            </div>
          </article>

          <article className="flex h-full flex-col rounded-2xl border border-blue-200 bg-surface p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Dla pacjentow</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">Akceptuj zaproszenie i pozostan w kontakcie</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Dolacz przez link zaproszenia, zaloguj sie i utrzymuj kontakt z fizjoterapeuta.
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Link
                href="/invite/accept"
                className="rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
              >
                Akceptuj zaproszenie
              </Link>
              <Link
                href="/login/patient"
                className="rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-foreground transition hover:bg-surface-muted"
              >
                Logowanie pacjenta
              </Link>
              <Link
                href="/patient"
                className="sm:col-span-2 rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-foreground transition hover:bg-surface-muted"
              >
                Portal pacjenta
              </Link>
            </div>
          </article>
        </section>
      </main>
    </>
  );
}
