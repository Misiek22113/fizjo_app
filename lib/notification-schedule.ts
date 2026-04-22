const TIME_24H_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const MAX_DAILY_REMINDERS = 8;

function parseTimeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map((part) => Number(part));
  return hours * 60 + minutes;
}

export type ValidatedSchedule = {
  times: string[];
  isEnabled: boolean;
};

export function validateSchedulePayload(payload: unknown): ValidatedSchedule | { error: string } {
  const body = payload as { times?: unknown; isEnabled?: unknown };
  const inputTimes = Array.isArray(body?.times) ? body.times : null;

  if (!inputTimes) {
    return { error: "Pole times jest wymagane." };
  }

  const parsedTimes = inputTimes.map((value) => (typeof value === "string" ? value.trim() : ""));

  if (parsedTimes.length === 0) {
    return { error: "Dodaj przynajmniej jedna godzine przypomnienia." };
  }

  if (parsedTimes.length > MAX_DAILY_REMINDERS) {
    return { error: `Maksymalnie ${MAX_DAILY_REMINDERS} przypomnien dziennie.` };
  }

  const invalidTime = parsedTimes.find((value) => !TIME_24H_PATTERN.test(value));

  if (invalidTime) {
    return { error: `Nieprawidlowa godzina: ${invalidTime}. Uzyj HH:mm.` };
  }

  const uniqueTimes = [...new Set(parsedTimes)];

  if (uniqueTimes.length !== parsedTimes.length) {
    return { error: "Godziny nie moga sie powtarzac." };
  }

  const sortedTimes = uniqueTimes.sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));

  return {
    times: sortedTimes,
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
