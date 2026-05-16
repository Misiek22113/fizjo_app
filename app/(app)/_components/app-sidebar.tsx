"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { AppRole } from "@/lib/auth/roles";
import { LogoutButton } from "./logout-button";

type AppSidebarProps = {
  role: AppRole;
};

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

function DashboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="10" width="8" height="11" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
    </svg>
  );
}

function PatientsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="17.5" cy="9" r="2.5" />
      <path d="M14.5 19c.2-1.9 1.7-3.4 3.6-3.7" />
    </svg>
  );
}

function PatientPortalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
      <path d="M19 7h2" />
      <path d="M20 6v2" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M6 6 18 18" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m15 5-7 7 7 7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

function navForRole(role: AppRole): NavItem[] {
  if (role === "physio") {
    return [
      { href: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
      { href: "/physio/patients", label: "Pacjenci", icon: <PatientsIcon /> },
    ];
  }

  return [
    { href: "/patient", label: "Portal pacjenta", icon: <PatientPortalIcon /> },
  ];
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  const navItems = navForRole(role);
  const roleLabel = role === "physio" ? "Fizjoterapeuta" : "Pacjent";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Otworz menu"
        className="fixed left-4 top-4 z-50 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-white text-foreground shadow-sm ring-1 ring-blue-100 md:hidden"
      >
        <MenuIcon />
      </button>

      <div
        className={`fixed inset-0 z-40 bg-slate-950/30 transition-opacity md:hidden ${
          isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsMobileOpen(false)}
      />

      <aside
        className={`fixed left-0 top-0 z-50 h-screen bg-surface shadow-lg transition-transform duration-200 md:static md:z-auto md:translate-x-0 md:shadow-none ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${isDesktopCollapsed ? "md:w-20" : "md:w-72"} w-72`}
      >
        <div className="flex h-full flex-col gap-4 p-4 md:sticky md:top-0 md:p-5">
          <div className="flex items-start justify-between gap-2">
            <div
              className={`space-y-1 ${isDesktopCollapsed ? "md:hidden" : ""}`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                Panel
              </p>
              <Link
                href="/"
                onClick={() => setIsMobileOpen(false)}
                className="inline-flex items-center gap-2 rounded-md pr-2 text-foreground transition-colors hover:text-blue-700"
                title="Strona glowna"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-dashed border-blue-200 bg-blue-50 text-[10px] font-semibold uppercase tracking-[0.08em] text-blue-700">
                  Logo
                </span>
                <span className="text-lg font-semibold">Fizjo App</span>
              </Link>
              <p className="text-sm text-muted-foreground">{roleLabel}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDesktopCollapsed((prev) => !prev)}
                aria-label={
                  isDesktopCollapsed ? "Rozwin sidebar" : "Zwin sidebar"
                }
                className="hidden h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-white text-foreground hover:bg-surface-muted md:inline-flex"
              >
                {isDesktopCollapsed ? (
                  <ChevronRightIcon />
                ) : (
                  <ChevronLeftIcon />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Zamknij menu"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-white text-foreground hover:bg-surface-muted md:hidden"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          <nav className="grid gap-1.5">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`group inline-flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-surface-muted text-foreground"
                      : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                  }`}
                  title={item.label}
                >
                  <span>{item.icon}</span>
                  <span className={isDesktopCollapsed ? "md:hidden" : ""}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex items-center justify-start px-1">
            <LogoutButton collapsed={isDesktopCollapsed} />
          </div>
        </div>
      </aside>
    </>
  );
}
