import Link from "next/link";
import { AppRole } from "@/lib/auth/roles";
import { LogoutButton } from "./logout-button";

type AppSidebarProps = {
  role: AppRole;
};

type NavItem = {
  href: string;
  label: string;
};

function navForRole(role: AppRole): NavItem[] {
  if (role === "physio") {
    return [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/physio/patients", label: "Pacjenci" },
      { href: "/", label: "Strona glowna" },
    ];
  }

  return [
    { href: "/patient", label: "Portal pacjenta" },
    { href: "/", label: "Strona glowna" },
  ];
}

export function AppSidebar({ role }: AppSidebarProps) {
  const navItems = navForRole(role);
  const roleLabel = role === "physio" ? "Fizjoterapeuta" : "Pacjent";

  return (
    <aside className="w-full border-b border-blue-100 bg-surface md:min-h-screen md:w-72 md:border-b-0 md:border-r">
      <div className="flex h-full flex-col gap-4 p-4 md:sticky md:top-0 md:p-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Panel</p>
          <p className="text-lg font-semibold text-foreground">Fizjo App</p>
          <p className="text-sm text-muted-foreground">{roleLabel}</p>
        </div>

        <nav className="grid gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="md:mt-auto">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
