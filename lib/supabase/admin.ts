import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey, publicEnv } from "@/lib/env";

export function createSupabaseAdminClient() {
  return createClient(publicEnv.supabaseUrl, getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
