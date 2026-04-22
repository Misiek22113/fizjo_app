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
  return requireEnv(process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY");
}

export const serverEnv = {
  get twilioAccountSid() {
    return requireEnv(process.env.TWILIO_ACCOUNT_SID, "TWILIO_ACCOUNT_SID");
  },
  get twilioAuthToken() {
    return requireEnv(process.env.TWILIO_AUTH_TOKEN, "TWILIO_AUTH_TOKEN");
  },
  get twilioMessagingServiceSid() {
    return requireEnv(
      process.env.TWILIO_MESSAGING_SERVICE_SID,
      "TWILIO_MESSAGING_SERVICE_SID",
    );
  },
  get cronSharedSecret() {
    return requireEnv(process.env.CRON_SHARED_SECRET, "CRON_SHARED_SECRET");
  },
  get appBaseUrl() {
    return requireEnv(process.env.APP_BASE_URL, "APP_BASE_URL");
  },
};
