"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type UserRole = "physio" | "patient";

type PasswordLoginFormProps = {
  role: UserRole;
  nextPath: string;
  allowSignUp: boolean;
  initialMode?: Mode;
  showInviteLink?: boolean;
};

type Mode = "login" | "signup";

function normalizeRedirectPath(path: string): string {
  return path.startsWith("/") ? path : "/dashboard";
}

export function PasswordLoginForm({
  role,
  nextPath,
  allowSignUp,
  initialMode = "login",
  showInviteLink = false,
}: PasswordLoginFormProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const safeNextPath = normalizeRedirectPath(nextPath);
  const isInviteFlow = safeNextPath.startsWith("/invite/accept");

  async function ensurePhysioProfile(userId: string, userEmail: string | null) {
    const { data: profile, error: profileFetchError } = await supabase
      .from("profiles")
      .select("id, role, email")
      .eq("id", userId)
      .maybeSingle();

    if (profileFetchError) {
      return profileFetchError.message;
    }

    if (!profile && userEmail) {
      const { error: createProfileError } = await supabase.from("profiles").insert({
        id: userId,
        role: "physio",
        email: userEmail,
      });

      if (createProfileError) {
        return createProfileError.message;
      }

      return null;
    }

    if (profile?.role && profile.role !== "physio") {
      return "To konto ma role pacjenta. Uzyj logowania pacjenta.";
    }

    return null;
  }

  async function validatePatientAccess(userId: string) {
    const { data: profile, error: profileFetchError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .maybeSingle();

    if (profileFetchError) {
      return { ok: false as const, code: "profile_error", message: profileFetchError.message };
    }

    if (profile?.role === "patient") {
      return { ok: true as const };
    }

    if (profile?.role === "physio") {
      return {
        ok: false as const,
        code: "wrong_role",
        message: "To konto ma role fizjoterapeuty. Uzyj logowania fizjoterapeuty.",
      };
    }

    if (!isInviteFlow) {
      return {
        ok: false as const,
        code: "inactive_patient",
        message: "Konto pacjenta nie jest aktywne. Uzyj linku zaproszenia od fizjoterapeuty.",
      };
    }

    return { ok: true as const };
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (role === "physio" && data.user) {
      const roleError = await ensurePhysioProfile(data.user.id, data.user.email ?? null);

      if (roleError) {
        setError(roleError);
        setLoading(false);
        return;
      }
    }

    if (role === "patient" && data.user) {
      const patientAccess = await validatePatientAccess(data.user.id);

      if (!patientAccess.ok) {
        if (patientAccess.code === "inactive_patient") {
          window.location.assign("/login/patient/inactive");
          return;
        }

        setError(patientAccess.message);
        setLoading(false);
        return;
      }
    }

    window.location.assign(safeNextPath);
  }

  async function handleSignUp() {
    setLoading(true);
    setMessage(null);
    setError(null);

    let patientInviteToken: string | null = null;

    if (role === "patient") {
      const eligibilityResponse = await fetch("/api/invites/patient-signup-eligibility", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const eligibilityPayload =
        (await eligibilityResponse.json().catch(() => null)) as
          | { eligible?: boolean; token?: string; error?: string }
          | null;

      if (!eligibilityResponse.ok) {
        setError(eligibilityPayload?.error ?? "Nie moge sprawdzic zaproszenia dla tego adresu.");
        setLoading(false);
        return;
      }

      if (!eligibilityPayload?.eligible || !eligibilityPayload.token) {
        setError(
          "Rejestracja pacjenta jest dostepna dopiero po dodaniu lub zaproszeniu przez fizjoterapeute.",
        );
        setLoading(false);
        return;
      }

      patientInviteToken = eligibilityPayload.token;
    }

    const redirectUrl = new URL("/auth/callback", window.location.origin);
    redirectUrl.searchParams.set(
      "next",
      role === "patient" && patientInviteToken
        ? `/invite/accept?token=${patientInviteToken}`
        : safeNextPath,
    );

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl.toString(),
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const hasSession = Boolean(data.session);

    if (hasSession) {
      if (role === "physio" && data.user) {
        const roleError = await ensurePhysioProfile(data.user.id, data.user.email ?? null);

        if (roleError) {
          setError(roleError);
          setLoading(false);
          return;
        }
      }

      if (role === "patient") {
        if (patientInviteToken) {
          window.location.assign(`/invite/accept?token=${encodeURIComponent(patientInviteToken)}`);
          return;
        }

        setError(
          "Rejestracja pacjenta jest dostepna dopiero po dodaniu lub zaproszeniu przez fizjoterapeute.",
        );
        setLoading(false);
        return;
      }

      window.location.assign(safeNextPath);
      return;
    }

    setMessage(
      role === "patient"
        ? "Sprawdz skrzynke email i potwierdz rejestracje. Po potwierdzeniu uzyj linku zaproszenia od fizjoterapeuty."
        : "Sprawdz skrzynke email i potwierdz rejestracje konta.",
    );
    setLoading(false);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (mode === "login") {
      await handleLogin(event);
      return;
    }

    event.preventDefault();
    await handleSignUp();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block space-y-2 text-sm">
        <span className="font-medium text-foreground">Email</span>
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          spellCheck={false}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-foreground transition-colors focus-visible:border-blue-400"
          placeholder="np. kontakt@gabinet.pl"
        />
      </label>

      <label className="block space-y-2 text-sm">
        <span className="font-medium text-foreground">Haslo</span>
        <input
          required
          minLength={8}
          type="password"
          name="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
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
          : mode === "login"
            ? "Zaloguj sie"
            : "Utworz konto"}
      </button>

      {allowSignUp ? (
        <p className="text-sm text-muted-foreground">
          {mode === "login"
            ? role === "physio"
              ? "Nie masz konta fizjoterapeuty?"
              : "Nie masz aktywnego konta pacjenta?"
            : "Masz juz konto?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setMessage(null);
            }}
            className="font-medium text-blue-700 hover:text-blue-800"
          >
            {mode === "login"
              ? role === "physio"
                ? "Zarejestruj sie"
                : "Aktywuj konto z zaproszenia"
              : "Wroc do logowania"}
          </button>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Konto pacjenta aktywuje fizjoterapeuta przez zaproszenie.
        </p>
      )}

      {showInviteLink ? (
        <p className="text-sm text-muted-foreground">
          Masz zaproszenie pacjenta?{" "}
          <Link href="/invite/accept" className="font-medium text-blue-700 hover:text-blue-800">
            Przejdz do akceptacji
          </Link>
        </p>
      ) : null}

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
