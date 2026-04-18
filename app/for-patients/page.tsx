import Link from "next/link";
import { PublicNavbar } from "../_components/public-navbar";

export default function ForPatientsPage() {
  return (
    <>
      <PublicNavbar />
      <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Dla pacjentow</p>
          <h1 className="text-balance text-3xl font-semibold text-foreground md:text-5xl">
            Trzymaj sie planu rehabilitacji
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
            Dolacz do fizjoterapeuty przez bezpieczne zaproszenie i utrzymuj regularnosc cwiczen
            pomiedzy wizytami.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-blue-100 bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Prosty start</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Otwierasz link zaproszenia, zakladasz konto lub logujesz sie i laczysz w kilka minut.
            </p>
          </article>
          <article className="rounded-2xl border border-blue-100 bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Regularne przypomnienia</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Otrzymujesz czytelne przypomnienia o cwiczeniach, ktore pomagaja utrzymac harmonogram.
            </p>
          </article>
          <article className="rounded-2xl border border-blue-100 bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Lepsza ciaglosc terapii</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Jestes na biezaco z planem fizjoterapeuty i pewniej przechodzisz przez proces zdrowienia.
            </p>
          </article>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/invite/accept"
            className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
          >
            Akceptuj zaproszenie
          </Link>
          <Link
            href="/login/patient"
            className="rounded-xl border border-blue-200 bg-surface px-4 py-3 text-center text-sm font-semibold text-foreground transition hover:bg-surface-muted"
          >
            Logowanie pacjenta
          </Link>
          <Link
            href="/patient"
            className="rounded-xl border border-blue-200 bg-surface px-4 py-3 text-center text-sm font-semibold text-foreground transition hover:bg-surface-muted"
          >
            Otworz portal
          </Link>
        </section>
      </main>
    </>
  );
}
