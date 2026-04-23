"use client";

import { FormEvent, useMemo, useState } from "react";

type NotificationsFormProps = {
  patientId: string;
  patientLabel: string;
  initialSlots: Array<{
    time: string;
    days: number[];
  }>;
  initialEnabled: boolean;
};

type ScheduleResponse = {
  schedule: {
    slots: Array<{
      time: string;
      days: number[];
    }>;
    is_enabled: boolean;
  };
};

type NotificationSlot = {
  time: string;
  days: number[];
};

const WEEKDAY_OPTIONS: Array<{ value: number; label: string; title: string }> =
  [
    { value: 1, label: "Pn", title: "Poniedzialek" },
    { value: 2, label: "Wt", title: "Wtorek" },
    { value: 3, label: "Sr", title: "Sroda" },
    { value: 4, label: "Cz", title: "Czwartek" },
    { value: 5, label: "Pt", title: "Piatek" },
    { value: 6, label: "So", title: "Sobota" },
    { value: 7, label: "Nd", title: "Niedziela" },
  ];

function normalizeDays(days: number[]): number[] {
  return [
    ...new Set(
      days.filter((day) => Number.isInteger(day) && day >= 1 && day <= 7),
    ),
  ].sort((a, b) => a - b);
}

function defaultSlot(previous: NotificationSlot | null): NotificationSlot {
  if (!previous) {
    return { time: "08:00", days: [1, 2, 3, 4, 5, 6, 7] };
  }

  return {
    time: defaultNextTime(previous.time),
    days: [1, 2, 3, 4, 5, 6, 7],
  };
}

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
  initialSlots,
  initialEnabled,
}: NotificationsFormProps) {
  const [slots, setSlots] = useState<NotificationSlot[]>(
    initialSlots.length > 0
      ? initialSlots.map((slot) => ({
          time: slot.time,
          days:
            normalizeDays(slot.days).length > 0
              ? normalizeDays(slot.days)
              : [1, 2, 3, 4, 5, 6, 7],
        }))
      : [defaultSlot(null)],
  );
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const slotCount = useMemo(() => slots.length, [slots]);

  function updateTime(index: number, value: string) {
    setSlots((prev) =>
      prev.map((entry, idx) =>
        idx === index ? { ...entry, time: value } : entry,
      ),
    );
  }

  function toggleDay(index: number, day: number) {
    setSlots((prev) =>
      prev.map((slot, idx) => {
        if (idx !== index) {
          return slot;
        }

        const hasDay = slot.days.includes(day);

        if (hasDay) {
          if (slot.days.length === 1) {
            return slot;
          }

          return {
            ...slot,
            days: slot.days.filter((value) => value !== day),
          };
        }

        return {
          ...slot,
          days: normalizeDays([...slot.days, day]),
        };
      }),
    );
  }

  function addSlot() {
    setSlots((prev) => {
      if (prev.length >= 2) {
        return prev;
      }

      return [...prev, defaultSlot(prev.at(-1) ?? null)];
    });
  }

  function removeSlot(index: number) {
    setSlots((prev) => {
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
      const response = await fetch(
        `/api/physio/patients/${patientId}/notifications`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            slots,
            isEnabled,
          }),
        },
      );

      const payload = (await response.json().catch(() => null)) as
        | ScheduleResponse
        | { error?: string }
        | null;

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
      setSlots(schedule.slots);
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
      const response = await fetch(
        `/api/physio/patients/${patientId}/notifications/test-send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        messageSid?: string;
        error?: string;
      } | null;

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
        <h2 className="text-lg font-semibold text-foreground">
          Powiadomienia dla: {patientLabel}
        </h2>
        <p className="text-sm text-muted-foreground">
          Ustaw maksymalnie 2 godziny i dni tygodnia dla kazdej godziny. Dostepne
          sa tylko pelne godziny i polowki (np. 08:00, 08:30). Strefa czasowa:
          Europe/Warsaw (CET/CEST).
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
          <span className="text-foreground">
            Wlaczone wysylanie przypomnien SMS
          </span>
        </label>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              Godziny powiadomien ({slotCount} / 2)
            </p>
            <button
              type="button"
              onClick={addSlot}
              disabled={slots.length >= 2}
              className="rounded-md border border-blue-200 bg-white px-2.5 py-1.5 text-xs font-medium text-blue-800 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Dodaj godzine
            </button>
          </div>

          <ul className="grid gap-2">
            {slots.map((slot, index) => (
              <li
                key={`${slot.time}-${index}`}
                className="rounded-lg border border-blue-100 bg-white p-3"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      step={1800}
                      value={slot.time}
                      onChange={(event) =>
                        updateTime(index, event.target.value)
                      }
                      required
                      className="w-full rounded-md border border-blue-200 px-2 py-1.5 text-sm text-foreground sm:w-40"
                    />
                    <button
                      type="button"
                      onClick={() => removeSlot(index)}
                      disabled={slots.length <= 1}
                      className="rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Usun
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {WEEKDAY_OPTIONS.map((day) => {
                      const isActive = slot.days.includes(day.value);

                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleDay(index, day.value)}
                          title={day.title}
                          aria-label={day.title}
                          aria-pressed={isActive}
                          className={`h-8 w-8 rounded-full border text-[11px] cursor-pointer font-semibold transition-colors ${
                            isActive
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-blue-200 bg-white text-blue-800 hover:bg-blue-50"
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-900">
          Plan: {slotCount} godz. z wybranymi dniami tygodnia.
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
        <p
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          aria-live="polite"
        >
          {error}
        </p>
      ) : null}

      {success ? (
        <p
          className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-900"
          aria-live="polite"
        >
          {success}
        </p>
      ) : null}
    </section>
  );
}
