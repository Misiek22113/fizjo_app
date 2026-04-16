function requireEnv(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export const publicEnv = {
  get supabaseUrl() {
    return requireEnv(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      "NEXT_PUBLIC_SUPABASE_URL",
    );
  },
  get supabaseAnonKey() {
    return requireEnv(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  },
};

export function getSupabaseServiceRoleKey(): string {
  return requireEnv(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    "SUPABASE_SERVICE_ROLE_KEY",
  );
}
