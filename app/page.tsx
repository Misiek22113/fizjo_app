import Link from "next/link";

export default function Home() {
  return (
    <main id="main-content" className="relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
      </div>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-8 pt-16 md:pt-24">
        <div className="space-y-5 text-center md:text-left">
          <span className="inline-flex rounded-full border border-blue-200 bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700 shadow-sm">
            Wizytowka aplikacji
          </span>
          <h1 className="mx-auto max-w-4xl text-balance text-4xl font-semibold leading-tight text-foreground md:mx-0 md:text-6xl">
            Skuteczniejsza fizjoterapia dzieki regularnym przypomnieniom o cwiczeniach
          </h1>
          <p className="mx-auto max-w-3xl text-pretty text-base text-muted-foreground md:mx-0 md:text-lg">
            Fizjo App pomaga fizjoterapeutom wysylac pacjentom powiadomienia o cwiczeniach,
            aby zwiekszyc regularnosc, przyspieszyc powrot do sprawnosci i poprawic efekty
            terapii.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login/physio"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-blue-400/20 transition hover:bg-primary-hover"
          >
            Rozpocznij jako fizjoterapeuta
          </Link>
          <Link
            href="/invite/accept"
            className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-surface px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
          >
            Mam zaproszenie pacjenta
          </Link>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-6 py-8 md:grid-cols-3">
        <article className="rounded-2xl border border-blue-100 bg-surface p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Krok 1</p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">Zaproś pacjenta</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Wysylasz jeden link, a pacjent zaklada konto lub loguje sie i dolacza do Twojej opieki.
          </p>
        </article>
        <article className="rounded-2xl border border-blue-100 bg-surface p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Krok 2</p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">Wysylaj przypomnienia</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Pacjent otrzymuje regularne powiadomienia o cwiczeniach, co buduje nawyk i systematycznosc.
          </p>
        </article>
        <article className="rounded-2xl border border-blue-100 bg-surface p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Krok 3</p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">Lepsze wyniki terapii</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Wieksza regularnosc cwiczen przeklada sie na szybszy i bezpieczniejszy powrot pacjenta do zdrowia.
          </p>
        </article>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-2 md:pb-24">
        <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
            Dlaczego fizjoterapeuci wybieraja Fizjo App?
          </h2>
          <div className="mt-5 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
            <p className="rounded-xl border border-blue-100 bg-white/90 px-4 py-3">
              Mniej czasu na reczne przypominanie i kontakt administracyjny.
            </p>
            <p className="rounded-xl border border-blue-100 bg-white/90 px-4 py-3">
              Wyzsza regularnosc wykonywania zaleconych cwiczen przez pacjenta.
            </p>
            <p className="rounded-xl border border-blue-100 bg-white/90 px-4 py-3">
              Lepsza wspolpraca fizjoterapeuta-pacjent i szybsza poprawa stanu zdrowia.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-6 pb-16 md:grid-cols-2 md:pb-20">
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
