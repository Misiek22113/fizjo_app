import Link from "next/link";
import { PasswordLoginForm } from "../_components/password-login-form";

type PatientLoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function PatientLoginPage({ searchParams }: PatientLoginPageProps) {
  const params = await searchParams;
  const candidateNextPath = params.next ?? "/patient";
  const nextPath = candidateNextPath.startsWith("/") ? candidateNextPath : "/patient";

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-16"
    >
      <section className="w-full space-y-6 rounded-2xl border border-blue-200 bg-surface p-8 shadow-sm">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Strefa Pacjenta</p>
          <h1 className="text-balance text-2xl font-semibold text-foreground">Logowanie pacjenta</h1>
          <p className="text-sm text-muted-foreground">
            Konto pacjenta jest aktywowane po zaproszeniu od fizjoterapeuty.
          </p>
        </header>

        <PasswordLoginForm
          role="patient"
          nextPath={nextPath}
          allowSignUp={false}
          showInviteLink
        />

        <Link href="/login" className="inline-flex text-sm font-medium text-blue-700 hover:text-blue-800">
          Wroc do wyboru logowania
        </Link>
      </section>
    </main>
  );
}
