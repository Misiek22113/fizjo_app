"use client";

import { useState } from "react";

type UnsubscribeButtonProps = {
  membershipId: string;
  disabled?: boolean;
};

export function UnsubscribeButton({
  membershipId,
  disabled = false,
}: UnsubscribeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleUnsubscribe() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/memberships/${membershipId}/unsubscribe`, {
        method: "POST",
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "Nie udalo sie wypisac relacji.");
        setLoading(false);
        return;
      }

      setDone(true);
      window.location.reload();
    } catch {
      setError("Wystapil blad polaczenia.");
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  if (disabled || done) {
    return (
      <span className="inline-flex rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500">
        Wypisano
      </span>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleUnsubscribe}
        disabled={loading}
        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Wypisywanie…" : "Wypisz sie"}
      </button>

      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
