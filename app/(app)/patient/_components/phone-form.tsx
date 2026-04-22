"use client";

import { FormEvent, useState } from "react";

type PhoneFormProps = {
  initialPhone: string;
};

export function PhoneForm({ initialPhone }: PhoneFormProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/patient/profile/phone", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const payload = (await response.json().catch(() => null)) as { phone?: string; error?: string } | null;

      if (!response.ok) {
        setError(payload?.error ?? "Nie udalo sie zapisac numeru telefonu.");
        setSaving(false);
        return;
      }

      setPhone(payload?.phone ?? phone);
      setSuccess("Numer telefonu zapisany.");
    } catch {
      setError("Wystapil blad polaczenia.");
    }

    setSaving(false);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-blue-200 bg-surface p-6 shadow-sm">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Numer telefonu do przypomnien SMS</h2>
        <p className="text-sm text-muted-foreground">
          Uzyj formatu E.164, np. +48500100200.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          required
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+48500100200"
          className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-foreground transition-colors focus-visible:border-blue-400"
        />

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Zapisywanie..." : "Zapisz numer"}
        </button>
      </form>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" aria-live="polite">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-900" aria-live="polite">
          {success}
        </p>
      ) : null}
    </section>
  );
}
