import Link from "next/link";
import { requirePageRole } from "@/lib/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NotificationsForm } from "./_components/notifications-form";

type NotificationsPageProps = {
  params: Promise<{ patientId: string }>;
};

type ProfileRecord = {
  id: string;
  email: string;
  display_name: string | null;
};

type ScheduleRecord = {
  slots: Array<{
    time: string;
    days: number[];
  }>;
  is_enabled: boolean;
};

export default async function PatientNotificationsPage({ params }: NotificationsPageProps) {
  const { patientId } = await params;
  const supabase = await createSupabaseServerClient();
  const auth = await requirePageRole(supabase, "physio", `/physio/patients/${patientId}/notifications`);

  const { data: membership } = await supabase
    .from("physio_patient_memberships")
    .select("id, status")
    .eq("physio_id", auth.user.id)
    .eq("patient_id", patientId)
    .maybeSingle();

  if (!membership) {
    return (
      <main
        id="main-content"
        className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10"
      >
        <header className="space-y-2">
          <Link href="/physio/patients" className="text-sm font-medium text-blue-700 hover:text-blue-800">
            Powrot do listy pacjentow
          </Link>
        </header>

        <section className="space-y-2 rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-red-900">Brak relacji z pacjentem</h1>
          <p className="text-sm text-red-800">
            Nie znaleziono relacji fizjoterapeuta-pacjent dla wybranego rekordu.
          </p>
        </section>
      </main>
    );
  }

  if (membership.status !== "active") {
    return (
      <main
        id="main-content"
        className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10"
      >
        <header className="space-y-2">
          <Link href="/physio/patients" className="text-sm font-medium text-blue-700 hover:text-blue-800">
            Powrot do listy pacjentow
          </Link>
        </header>

        <section className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-amber-900">Relacja jest nieaktywna</h1>
          <p className="text-sm text-amber-800">
            Dla relacji o statusie {membership.status} nie mozna konfigurowac przypomnien SMS.
          </p>
        </section>
      </main>
    );
  }

  const { data: patientProfile } = await supabase
    .from("profiles")
    .select("id, email, display_name")
    .eq("id", patientId)
    .maybeSingle();

  if (!patientProfile) {
    return (
      <main
        id="main-content"
        className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10"
      >
        <header className="space-y-2">
          <Link href="/physio/patients" className="text-sm font-medium text-blue-700 hover:text-blue-800">
            Powrot do listy pacjentow
          </Link>
        </header>

        <section className="space-y-2 rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-red-900">Nie znaleziono profilu pacjenta</h1>
          <p className="text-sm text-red-800">Nie udalo sie odczytac danych profilu dla tego pacjenta.</p>
        </section>
      </main>
    );
  }

  const { data: schedule } = await supabase
    .from("patient_notification_schedules")
    .select("slots, times, is_enabled")
    .eq("physio_id", auth.user.id)
    .eq("patient_id", patientId)
    .maybeSingle();

  const typedProfile = patientProfile as ProfileRecord;
  const typedSchedule = schedule as ScheduleRecord | null;

  const initialSlots = typedSchedule?.slots?.length
    ? typedSchedule.slots.map((slot) => ({
        time: slot.time.slice(0, 5),
        days: slot.days,
      }))
    : ((schedule as { times?: string[] } | null)?.times ?? ["08:00"]).map((value) => ({
        time: value.slice(0, 5),
        days: [1, 2, 3, 4, 5, 6, 7],
      }));

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-10"
    >
      <header className="space-y-2">
        <Link href="/physio/patients" className="text-sm font-medium text-blue-700 hover:text-blue-800">
          Powrot do listy pacjentow
        </Link>
        <div>
          <h1 className="text-balance text-2xl font-semibold text-foreground">Harmonogram przypomnien</h1>
          <p className="text-sm text-muted-foreground">
            Konfiguracja przypomnien SMS dla pacjenta.
          </p>
        </div>
      </header>

      <NotificationsForm
        patientId={patientId}
        patientLabel={typedProfile.display_name || typedProfile.email}
        initialSlots={initialSlots}
        initialEnabled={typedSchedule?.is_enabled ?? true}
      />
    </main>
  );
}
