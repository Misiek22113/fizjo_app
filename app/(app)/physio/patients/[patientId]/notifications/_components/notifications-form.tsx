"use client";

import { FormEvent, useMemo, useState } from "react";

type NotificationsFormProps = {
  patientId: string;
  patientLabel: string;
  initialTimes: string[];
  initialEnabled: boolean;
};

type ScheduleResponse = {
  schedule: {
    times: string[];
    is_enabled: boolean;
  };
};

function defaultNextTime(previous: string | null): string {
  if (!previous) {
    return "08:00";
  }

  const [hours, minutes] = previous.split(":").map((part) => Number(part));
  const total = hours * 60 + minutes + 120;
  const nextHours = Math.floor((total % (24 * 60)) / 60);
  const nextMinutes = total % 60;

  return `${nextHours.toString().padStart(2, "0")}:${nextMinutes.toString().padStart(2, "0")}`;
}

export function NotificationsForm({
  patientId,
  patientLabel,
  initialTimes,
  initialEnabled,
}: NotificationsFormProps) {
  const [times, setTimes] = useState<string[]>(
    initialTimes.length > 0 ? initialTimes : ["08:00"],
  );
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const dailyCount = useMemo(() => times.length, [times]);

  function updateTime(index: number, value: string) {
    setTimes((prev) => prev.map((entry, idx) => (idx === index ? value : entry)));
  }

  function addTime() {
    setTimes((prev) => {
      if (prev.length >= 8) {
        return prev;
      }

      return [...prev, defaultNextTime(prev.at(-1) ?? null)];
    });
  }

  function removeTime(index: number) {
    setTimes((prev) => {
      if (prev.length === 1) {
        return prev;
      }

      return prev.filter((_, idx) => idx !== index);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/physio/patients/${patientId}/notifications`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          times,
          isEnabled,
        }),
      });

      const payload = (await response.json().catch(() => null)) as ScheduleResponse | { error?: string } | null;

      if (!response.ok) {
        setError(
          payload && "error" in payload && typeof payload.error === "string"
            ? payload.error
            : "Nie udalo sie zapisac harmonogramu.",
        );
        setSaving(false);
        return;
      }

      const schedule = (payload as ScheduleResponse).schedule;
      setTimes(schedule.times);
      setIsEnabled(schedule.is_enabled);
      setSuccess("Harmonogram zapisany.");
    } catch {
      setError("Wystapil blad polaczenia.");
    }

    setSaving(false);
  }

  async function handleTestSend() {
    setSendingTest(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/physio/patients/${patientId}/notifications/test-send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; messageSid?: string; error?: string }
        | null;

      if (!response.ok) {
        setError(payload?.error ?? "Nie udalo sie wyslac testowego SMS.");
        setSendingTest(false);
        return;
      }

      setSuccess(
        payload?.messageSid
          ? `Testowy SMS wyslany. SID: ${payload.messageSid}`
          : "Testowy SMS wyslany.",
      );
    } catch {
      setError("Wystapil blad polaczenia przy wysylce testowego SMS.");
    }

    setSendingTest(false);
  }

  return (
    <section className="space-y-5 rounded-2xl border border-blue-200 bg-surface p-6 shadow-sm">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Powiadomienia dla: {patientLabel}</h2>
        <p className="text-sm text-muted-foreground">
          Ustaw dokladne godziny przypomnien. Strefa czasowa: Europe/Warsaw (CET/CEST).
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(event) => setIsEnabled(event.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-foreground">Wlaczone wysylanie przypomnien SMS</span>
        </label>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Godziny dzienne ({dailyCount} / 8)</p>
            <button
              type="button"
              onClick={addTime}
              disabled={times.length >= 8}
              className="rounded-md border border-blue-200 bg-white px-2.5 py-1.5 text-xs font-medium text-blue-800 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Dodaj godzine
            </button>
          </div>

          <ul className="grid gap-2 sm:grid-cols-2">
            {times.map((time, index) => (
              <li key={`${time}-${index}`} className="flex items-center gap-2 rounded-lg border border-blue-100 bg-white p-2">
                <input
                  type="time"
                  value={time}
                  onChange={(event) => updateTime(index, event.target.value)}
                  required
                  className="w-full rounded-md border border-blue-200 px-2 py-1.5 text-sm text-foreground"
                />
                <button
                  type="button"
                  onClick={() => removeTime(index)}
                  disabled={times.length <= 1}
                  className="rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Usun
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-900">
          Plan: {dailyCount} przypomnien dziennie.
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Zapisywanie..." : "Zapisz harmonogram"}
        </button>

        <button
          type="button"
          onClick={handleTestSend}
          disabled={sendingTest}
          className="ml-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 font-medium text-blue-900 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {sendingTest ? "Wysylanie testu..." : "Wyslij testowy SMS teraz"}
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
