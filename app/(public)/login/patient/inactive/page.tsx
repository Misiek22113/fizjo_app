import Link from "next/link";

export default function InactivePatientAccountPage() {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-xl items-center px-6 py-16"
    >
      <section className="w-full space-y-5 rounded-2xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Konto pacjenta</p>
          <h1 className="text-balance text-2xl font-semibold text-amber-900">
            Konto jeszcze nieaktywne
          </h1>
          <p className="text-sm text-amber-800">
            Pacjent nie tworzy konta samodzielnie. Konto aktywuje sie dopiero po zaproszeniu od
            fizjoterapeuty.
          </p>
        </header>

        <div className="space-y-2 rounded-xl border border-amber-200 bg-white p-4 text-sm text-foreground">
          <p className="font-medium">Co teraz?</p>
          <p>1. Popros fizjoterapeute o zaproszenie na Twoj email.</p>
          <p>2. Otworz link z zaproszenia i zaloz konto pacjenta.</p>
          <p>3. Zaloguj sie i zaakceptuj zaproszenie.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/login/patient"
            className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100"
          >
            Wroc do logowania pacjenta
          </Link>
          <Link
            href="/invite/accept"
            className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Mam link zaproszenia
          </Link>
        </div>
      </section>
    </main>
  );
}
