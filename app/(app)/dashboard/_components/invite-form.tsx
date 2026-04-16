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
    <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">Dodaj pacjenta</h2>

      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-zinc-800">Email pacjenta</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none ring-emerald-200 transition focus:ring"
            placeholder="pacjent@email.com"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-zinc-800">Telefon (opcjonalnie)</span>
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none ring-emerald-200 transition focus:ring"
            placeholder="+48500100200"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="sm:col-span-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Tworzenie..." : "Utworz zaproszenie"}
        </button>
      </form>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {success ? (
        <div className="space-y-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          <p>Zaproszenie utworzone. Na etapie A wyslij ten link recznie mailem:</p>
          <p className="break-all font-medium">{success.inviteUrl}</p>
        </div>
      ) : null}
    </section>
  );
}
