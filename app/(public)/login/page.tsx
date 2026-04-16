import { LoginForm } from "./_components/login-form";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const candidateNextPath = params.next ?? "/dashboard";
  const nextPath = candidateNextPath.startsWith("/")
    ? candidateNextPath
    : "/dashboard";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-16">
      <section className="w-full space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-zinc-900">Logowanie</h1>
          <p className="text-sm text-zinc-600">
            Podaj email, a wyslemy Ci magic link do zalogowania.
          </p>
        </header>

        <LoginForm nextPath={nextPath} />
      </section>
    </main>
  );
}
