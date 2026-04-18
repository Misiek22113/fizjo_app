import Link from "next/link";
import { PublicNavbar } from "./_components/public-navbar";

export default function Home() {
  return (
    <>
      <PublicNavbar />
      <main id="main-content" className="relative overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl" />
          <div className="absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
        </div>

        <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-8 pt-16 md:pt-24">
          <div className="space-y-5 text-center md:text-left">
            <span className="inline-flex rounded-full border border-blue-200 bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700 shadow-sm">
              Platforma przypomnien dla fizjoterapii
            </span>
            <h1 className="mx-auto max-w-4xl text-balance text-4xl font-semibold leading-tight text-foreground md:mx-0 md:text-6xl">
              Lepsze efekty terapii dzieki regularnym przypomnieniom o cwiczeniach
            </h1>
            <p className="mx-auto max-w-3xl text-pretty text-base text-muted-foreground md:mx-0 md:text-lg">
              Fizjo App pomaga fizjoterapeutom wysylac przypomnienia, ktore wspieraja
              systematyczne wykonywanie cwiczen domowych, zwiekszaja regularnosc i przyspieszaja
              powrot do zdrowia.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/for-physios"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-blue-400/20 transition hover:bg-primary-hover"
            >
              Zobacz dla fizjoterapeutow
            </Link>
            <Link
              href="/for-patients"
              className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-surface px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
            >
              Zobacz dla pacjentow
            </Link>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto grid w-full max-w-6xl gap-4 px-6 py-8 md:grid-cols-3">
          <article className="rounded-2xl border border-blue-100 bg-surface p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Krok 1</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">Zaproś pacjenta</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Wysylasz jeden bezpieczny link, a pacjent zaklada konto lub loguje sie w kilka chwil.
            </p>
          </article>
          <article className="rounded-2xl border border-blue-100 bg-surface p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Krok 2</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">Wysylaj przypomnienia</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Pacjent otrzymuje czytelne powiadomienia, ktore pomagaja utrzymac rytm cwiczen.
            </p>
          </article>
          <article className="rounded-2xl border border-blue-100 bg-surface p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Krok 3</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">Poprawiaj wyniki terapii</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Wieksza regularnosc przeklada sie na lepszy postep rehabilitacji i wieksza pewnosc pacjenta.
            </p>
          </article>
        </section>

        <section id="benefits" className="mx-auto w-full max-w-6xl px-6 pb-16 pt-2 md:pb-24">
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
              Dlaczego zespoly wybieraja Fizjo App
            </h2>
            <div className="mt-5 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
              <p className="rounded-xl border border-blue-100 bg-white/90 px-4 py-3">
                Mniej recznego przypominania i mniej pomijanych sesji cwiczen.
              </p>
              <p className="rounded-xl border border-blue-100 bg-white/90 px-4 py-3">
                Wieksza systematycznosc pacjentow pomiedzy wizytami.
              </p>
              <p className="rounded-xl border border-blue-100 bg-white/90 px-4 py-3">
                Sprawniejsza wspolpraca fizjoterapeuty z pacjentem od pierwszego dnia.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
