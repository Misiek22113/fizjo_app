"use client";

import { FormEvent, useState } from "react";

type InviteFormResponse = {
  inviteUrl: string;
  token: string;
};

export function InviteForm() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<InviteFormResponse | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  async function handleCopyInviteUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopyMessage("Link skopiowany.");
    } catch {
      setCopyMessage("Nie udalo sie skopiowac linku. Skopiuj go recznie.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, phone }),
      });

      const payload = await response.json();

      if (!response.ok) {
        const message =
          typeof payload?.error === "string"
            ? payload.error
            : "Nie udalo sie utworzyc zaproszenia.";
        setError(message);
        setLoading(false);
        return;
      }

      setSuccess(payload as InviteFormResponse);
      setEmail("");
      setPhone("");
    } catch {
      setError("Wystapil blad polaczenia.");
    }

    setLoading(false);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-blue-200 bg-surface p-6 shadow-sm">
      <h2 className="text-balance text-lg font-semibold text-foreground">Dodaj Pacjenta</h2>

      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-foreground">Email Pacjenta</span>
          <input
            required
            type="email"
            name="patient-email"
            autoComplete="off"
            spellCheck={false}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-foreground transition-colors focus-visible:border-blue-400"
            placeholder="pacjent@email.com…"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-foreground">Telefon (Opcjonalnie)</span>
          <input
            type="tel"
            name="patient-phone"
            autoComplete="off"
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-foreground transition-colors focus-visible:border-blue-400"
            placeholder="+48 500 100 200…"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="sm:col-span-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Tworzenie…" : "Utworz Zaproszenie"}
        </button>
      </form>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" aria-live="polite">
          {error}
        </p>
      ) : null}

      {success ? (
        <div className="space-y-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-900" aria-live="polite">
          <p>
            Zaproszenie utworzone. Na razie przekaz ten link pacjentowi recznie (np. SMS/komunikator).
          </p>
          <p className="text-blue-800">
            Pacjent przez ten link zalozy konto lub zaloguje sie i zaakceptuje zaproszenie.
          </p>
          <p className="break-all font-medium">{success.inviteUrl}</p>
          <button
            type="button"
            onClick={() => handleCopyInviteUrl(success.inviteUrl)}
            className="rounded-md border border-blue-200 bg-white px-2.5 py-1.5 text-xs font-medium text-blue-800 transition-colors hover:bg-blue-100"
          >
            Kopiuj link
          </button>
          {copyMessage ? <p className="text-xs text-blue-800">{copyMessage}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
