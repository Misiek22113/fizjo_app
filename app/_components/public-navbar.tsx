import Link from "next/link";

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-blue-100/80 bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="text-sm font-semibold tracking-wide text-foreground">
          Fizjo App
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <Link
            href="/for-physios"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-surface-muted hover:text-foreground"
          >
            Dla fizjoterapeutow
          </Link>
          <Link
            href="/for-patients"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-surface-muted hover:text-foreground"
          >
            Dla pacjentow
          </Link>
          <Link
            href="/app"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
          >
            Logowanie
          </Link>
        </nav>

        <Link
          href="/app"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover md:hidden"
        >
          Logowanie
        </Link>
      </div>
    </header>
  );
}
