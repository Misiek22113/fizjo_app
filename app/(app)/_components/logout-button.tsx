"use client";

import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type LogoutButtonProps = {
  collapsed?: boolean;
};

export function LogoutButton({ collapsed = false }: LogoutButtonProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    window.location.assign("/app");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      aria-label="Wyloguj"
      title="Wyloguj"
      className={`inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-white px-3 text-foreground transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-70 ${
        collapsed ? "w-10 px-0" : "gap-2"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={`h-5 w-5 ${loading ? "animate-pulse" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3.5 21h11a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-11" />
        <path d="M10 17l4-5-4-5" />
        <path d="M14 12H2.5" />
      </svg>
      {!collapsed ? <span className="text-sm font-medium">Wyloguj</span> : null}
    </button>
  );
}
