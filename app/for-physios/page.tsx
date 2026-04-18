import Link from "next/link";
import { PublicNavbar } from "../_components/public-navbar";

export default function ForPhysiosPage() {
  return (
    <>
      <PublicNavbar />
      <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Dla fizjoterapeutow</p>
          <h1 className="text-balance text-3xl font-semibold text-foreground md:text-5xl">
            Utrzymuj regularnosc pacjentow pomiedzy wizytami
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
            Fizjo App pomaga szybko zapraszac pacjentow i wspierac systematycznosc dzieki
            przejrzystemu flow opartemu o przypomnienia.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-blue-100 bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Szybkie wdrozenie pacjenta</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Zapraszasz pacjenta jednym linkiem i rozpoczynasz wspolprace bez zbednej administracji.
            </p>
          </article>
          <article className="rounded-2xl border border-blue-100 bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Przejrzysty kontekst terapii</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Relacje z pacjentami pozostaja uporzadkowane i widoczne w dedykowanych widokach.
            </p>
          </article>
          <article className="rounded-2xl border border-blue-100 bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Lepsze efekty rehabilitacji</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Wieksza regularnosc cwiczen domowych przeklada sie na lepsze wyniki terapii.
            </p>
          </article>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/login/physio"
            className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
          >
            Logowanie fizjoterapeuty
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-blue-200 bg-surface px-4 py-3 text-center text-sm font-semibold text-foreground transition hover:bg-surface-muted"
          >
            Otworz dashboard
          </Link>
          <Link
            href="/physio/patients"
            className="rounded-xl border border-blue-200 bg-surface px-4 py-3 text-center text-sm font-semibold text-foreground transition hover:bg-surface-muted"
          >
            Otworz pacjentow
          </Link>
        </section>
      </main>
    </>
  );
}
