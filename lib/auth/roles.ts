import { redirect } from "next/navigation";

export type AppRole = "physio" | "patient";

type AuthState = {
  user: { id: string; email?: string | null } | null;
  role: AppRole | null;
};

type PageRoleResult = {
  user: { id: string; email?: string | null };
  role: AppRole;
};

export type ApiRoleResult =
  | { ok: true; user: { id: string; email?: string | null }; role: AppRole }
  | { ok: false; status: 401 | 403; error: string };

type AuthHelperClient = {
  auth: {
    getUser: () => Promise<{
      data: { user: { id: string; email?: string | null } | null };
    }>;
  };
  from: (table: "profiles") => {
    select: (query: "id, role, email") => {
      eq: (column: "id", value: string) => {
        maybeSingle: () => Promise<{
          data: { role?: AppRole | null } | null;
        }>;
      };
    };
  };
};

export async function getAuthState(supabase: unknown): Promise<AuthState> {
  const client = supabase as AuthHelperClient;
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { user: null, role: null };
  }

  const { data: profile } = await client
    .from("profiles")
    .select("id, role, email")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    role: (profile?.role as AppRole | undefined) ?? null,
  };
}

function buildRoleLoginPath(role: AppRole, nextPath: string): string {
  const encodedNext = encodeURIComponent(nextPath);
  return `/login/${role}?next=${encodedNext}`;
}

export async function requirePageRole(
  supabase: unknown,
  role: AppRole,
  nextPath: string,
): Promise<PageRoleResult> {
  const authState = await getAuthState(supabase);

  if (!authState.user) {
    redirect(buildRoleLoginPath(role, nextPath));
  }

  if (authState.role !== role) {
    if (authState.role === "physio") {
      redirect("/dashboard");
    }

    if (authState.role === "patient") {
      redirect("/patient");
    }

    redirect(buildRoleLoginPath(role, nextPath));
  }

  return {
    user: authState.user,
    role: authState.role,
  };
}

export async function requireApiRole(
  supabase: unknown,
  role: AppRole,
): Promise<ApiRoleResult> {
  const authState = await getAuthState(supabase);

  if (!authState.user) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  if (authState.role !== role) {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  return { ok: true, user: authState.user, role: authState.role };
}
