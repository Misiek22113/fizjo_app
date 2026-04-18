import Link from "next/link";
import { PublicNavbar } from "../_components/public-navbar";

export default function AppHubPage() {
  return (
    <>
      <PublicNavbar />
      <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Centrum aplikacji</p>
          <h1 className="text-balance text-3xl font-semibold text-foreground md:text-5xl">Wybierz swoja strefe</h1>
          <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
            Tylko dwa kroki dla kazdej roli: zaloguj sie albo zarejestruj.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="flex h-full flex-col rounded-2xl border border-blue-200 bg-surface p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Dla fizjoterapeutow</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">Panel fizjoterapeuty</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Zarzadzaj pacjentami, zaproszeniami i przebiegiem wspolpracy.
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Link
                href="/login/physio?next=%2Fdashboard&mode=login"
                className="rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
              >
                Zaloguj
              </Link>
              <Link
                href="/login/physio?next=%2Fdashboard&mode=signup"
                className="rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-foreground transition hover:bg-surface-muted"
              >
                Zarejestruj
              </Link>
            </div>
          </article>

          <article className="flex h-full flex-col rounded-2xl border border-blue-200 bg-surface p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Dla pacjentow</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">Panel pacjenta</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Rejestracja i logowanie konta pacjenta po dodaniu przez fizjoterapeute.
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Link
                href="/login/patient?next=%2Fpatient&mode=login"
                className="rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
              >
                Zaloguj
              </Link>
              <Link
                href="/login/patient?next=%2Fpatient&mode=signup"
                className="rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-foreground transition hover:bg-surface-muted"
              >
                Zarejestruj
              </Link>
            </div>
          </article>
        </section>
      </main>
    </>
  );
}
