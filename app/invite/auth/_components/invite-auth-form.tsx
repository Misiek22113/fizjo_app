"use client";

import { FormEvent, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type InviteAuthFormProps = {
  token: string;
  invitedEmail: string;
};

type Mode = "signup" | "login";

export function InviteAuthForm({ token, invitedEmail }: InviteAuthFormProps) {
  const [mode, setMode] = useState<Mode>("signup");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  async function redirectToAccept() {
    window.location.assign(`/invite/accept?token=${encodeURIComponent(token)}`);
  }

  async function handleSignUp() {
    const redirectUrl = new URL("/auth/callback", window.location.origin);
    redirectUrl.searchParams.set("next", `/invite/accept?token=${token}`);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: invitedEmail,
      password,
      options: {
        emailRedirectTo: redirectUrl.toString(),
      },
    });

    if (signUpError) {
      if (signUpError.message.toLowerCase().includes("already registered")) {
        setMode("login");
        setMessage("To konto juz istnieje. Zaloguj sie ponizej, aby zaakceptowac zaproszenie.");
        return;
      }

      setError(signUpError.message);
      return;
    }

    if (data.session) {
      await redirectToAccept();
      return;
    }

    setMessage(
      "Wyslalem email potwierdzajacy. Potwierdz adres i wroc do linku zaproszenia.",
    );
  }

  async function handleLogin() {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: invitedEmail,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      return;
    }

    await redirectToAccept();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === "signup") {
      await handleSignUp();
    } else {
      await handleLogin();
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block space-y-2 text-sm">
        <span className="font-medium text-foreground">Email z zaproszenia</span>
        <input
          value={invitedEmail}
          readOnly
          type="email"
          className="w-full cursor-not-allowed rounded-lg border border-blue-200 bg-slate-100 px-3 py-2 text-foreground"
        />
      </label>

      <label className="block space-y-2 text-sm">
        <span className="font-medium text-foreground">{mode === "signup" ? "Ustaw haslo" : "Haslo"}</span>
        <input
          required
          minLength={8}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-foreground transition-colors focus-visible:border-blue-400"
          placeholder="Minimum 8 znakow"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading
          ? "Przetwarzanie..."
          : mode === "signup"
            ? "Utworz konto pacjenta"
            : "Zaloguj i zaakceptuj zaproszenie"}
      </button>

      <p className="text-sm text-muted-foreground">
        {mode === "signup" ? "Masz juz konto?" : "Nie masz jeszcze konta?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signup" ? "login" : "signup");
            setError(null);
            setMessage(null);
          }}
          className="font-medium text-blue-700 hover:text-blue-800"
        >
          {mode === "signup" ? "Przejdz do logowania" : "Utworz konto"}
        </button>
      </p>

      {message ? (
        <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800" aria-live="polite">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" aria-live="polite">
          {error}
        </p>
      ) : null}
    </form>
  );
}
