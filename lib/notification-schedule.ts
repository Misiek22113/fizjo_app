const TIME_24H_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const MAX_DAILY_REMINDER_SLOTS = 2;

type RawScheduleSlot = {
  time?: unknown;
  days?: unknown;
};

export type ScheduleSlot = {
  time: string;
  days: number[];
};

function parseTimeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map((part) => Number(part));
  return hours * 60 + minutes;
}

export type ValidatedSchedule = {
  slots: ScheduleSlot[];
  isEnabled: boolean;
};

export function validateSchedulePayload(payload: unknown): ValidatedSchedule | { error: string } {
  const body = payload as { slots?: unknown; isEnabled?: unknown };
  const inputSlots = Array.isArray(body?.slots) ? body.slots : null;

  if (!inputSlots) {
    return { error: "Pole slots jest wymagane." };
  }

  if (inputSlots.length === 0) {
    return { error: "Dodaj przynajmniej jedna godzine przypomnienia." };
  }

  if (inputSlots.length > MAX_DAILY_REMINDER_SLOTS) {
    return { error: `Maksymalnie ${MAX_DAILY_REMINDER_SLOTS} godziny przypomnien dziennie.` };
  }

  const normalizedSlots: ScheduleSlot[] = [];

  for (let index = 0; index < inputSlots.length; index += 1) {
    const slot = inputSlots[index] as RawScheduleSlot;
    const slotTime = typeof slot?.time === "string" ? slot.time.trim() : "";
    const slotDays = Array.isArray(slot?.days) ? slot.days : [];

    if (!TIME_24H_PATTERN.test(slotTime)) {
      return { error: `Nieprawidlowa godzina w pozycji ${index + 1}. Uzyj HH:mm.` };
    }

    const parsedDays = slotDays.filter((day) => Number.isInteger(day)).map((day) => Number(day));
    const invalidDay = parsedDays.find((day) => day < 1 || day > 7);

    if (invalidDay) {
      return { error: `Nieprawidlowy dzien tygodnia (${invalidDay}) w pozycji ${index + 1}.` };
    }

    const uniqueDays = [...new Set(parsedDays)].sort((a, b) => a - b);

    if (uniqueDays.length === 0) {
      return { error: `Wybierz przynajmniej jeden dzien tygodnia dla godziny ${slotTime}.` };
    }

    normalizedSlots.push({
      time: slotTime,
      days: uniqueDays,
    });
  }

  const uniqueTimes = [...new Set(normalizedSlots.map((slot) => slot.time))];

  if (uniqueTimes.length !== normalizedSlots.length) {
    return { error: "Godziny nie moga sie powtarzac." };
  }

  const sortedSlots = normalizedSlots.sort(
    (a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time),
  );

  return {
    slots: sortedSlots,
    isEnabled: body?.isEnabled === false ? false : true,
  };
}

export function formatScheduleLocalDateTime(
  baseDate: Date,
  time: string,
  timeZone: string,
): string {
  const [hours, minutes] = time.split(":").map((part) => Number(part));
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("sv-SE", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(" ", "T");
}

export function getCurrentTimeInZone(timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function getCurrentDateInZone(timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date());
}

export function getCurrentIsoWeekdayInZone(timeZone: string): number {
  const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  const weekdayLabel = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  })
    .format(new Date())
    .toLowerCase();

  const dayIndex = weekdays.indexOf(weekdayLabel as (typeof weekdays)[number]);

  if (dayIndex === -1) {
    return 1;
  }

  return dayIndex === 0 ? 7 : dayIndex;
}
