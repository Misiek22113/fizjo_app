const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

export function normalizePhoneToE164(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const compact = trimmed.replace(/[\s()-]/g, "");

  if (!E164_PATTERN.test(compact)) {
    return null;
  }

  return compact;
}
