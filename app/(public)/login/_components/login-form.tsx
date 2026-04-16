"use client";

import { FormEvent, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const redirectUrl = new URL("/auth/callback", window.location.origin);
    redirectUrl.searchParams.set("next", nextPath);

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl.toString(),
      },
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    setMessage("Wyslalem link do logowania na podany email.");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block space-y-2 text-sm">
        <span className="font-medium text-zinc-800">Email</span>
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none ring-emerald-200 transition focus:ring"
          placeholder="np. fizjo@gabinet.com"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Wysylanie..." : "Wyslij magic link"}
      </button>

      {message ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
    </form>
  );
}
