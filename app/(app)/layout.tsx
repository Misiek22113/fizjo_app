import { redirect } from "next/navigation";
import { AppSidebar } from "./_components/app-sidebar";
import { getAuthState } from "@/lib/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PrivateAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const authState = await getAuthState(supabase);

  if (!authState.user || !authState.role) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen md:flex md:bg-background">
      <AppSidebar role={authState.role} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
