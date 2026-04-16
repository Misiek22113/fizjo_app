import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  const safeRedirectPath = next.startsWith("/") ? next : "/dashboard";
  const response = NextResponse.redirect(new URL(safeRedirectPath, request.url));

  if (code) {
    const supabase = createSupabaseRouteHandlerClient(request, response);
    await supabase.auth.exchangeCodeForSession(code);
  }

  return response;
}
