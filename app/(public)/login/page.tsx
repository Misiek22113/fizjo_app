import Link from "next/link";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

function buildRoleHref(rolePath: "physio" | "patient", nextPath: string): string {
  const encodedNext = encodeURIComponent(nextPath);
  return `/login/${rolePath}?next=${encodedNext}`;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const candidateNextPath = params.next ?? "/dashboard";
  const nextPath = candidateNextPath.startsWith("/") ? candidateNextPath : "/dashboard";

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-16"
    >
      <section className="w-full space-y-6 rounded-2xl border border-blue-200 bg-surface p-8 shadow-sm">
        <header className="space-y-2">
          <h1 className="text-balance text-3xl font-semibold text-foreground">Wybierz typ logowania</h1>
          <p className="text-sm text-muted-foreground">
            Rozdzielamy logowanie dla fizjoterapeuty i pacjenta, zeby flow byl czytelny i bezpieczny.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href={buildRoleHref("physio", nextPath)}
            className="rounded-xl border border-blue-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:bg-surface-muted"
          >
            <p className="text-lg font-semibold text-foreground">Fizjoterapeuta</p>
            <p className="mt-1 text-sm text-muted-foreground">Logowanie i rejestracja konta gabinetowego.</p>
          </Link>

          <Link
            href={buildRoleHref("patient", nextPath)}
            className="rounded-xl border border-blue-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:bg-surface-muted"
          >
            <p className="text-lg font-semibold text-foreground">Pacjent</p>
            <p className="mt-1 text-sm text-muted-foreground">Logowanie konta aktywowanego przez zaproszenie.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
