import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import SignOutButton from "./signout-button";
import Link from "next/link";
import PlantCard from "./plant-card";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: household } = await supabase
    .from("households")
    .select("id, name")
    .single();

  if (!household) {
    redirect("/login");
  }

  const { data: plants } = await supabase
    .from("plants")
    .select(
      `
    id,
    name,
    species,
    location,
    photo_url,
    plant_care_tasks (
      id,
      action,
      interval_days,
      is_enabled
    )
  `,
    )
    .eq("household_id", household.id)
    .order("created_at", { ascending: false });

  const { data: careLogs } = await supabase
    .from("care_logs")
    .select("plant_id, action, logged_at")
    .in("plant_id", plants?.map((p) => p.id) ?? []);
  const sortedPlants =
    plants
      ?.map((plant) => {
        const plantLogs =
          careLogs?.filter((l) => l.plant_id === plant.id) ?? [];
        const maxUrgency = plant.plant_care_tasks
          .filter((t) => t.is_enabled)
          .reduce((max, task) => {
            const lastLog = plantLogs
              .filter((l) => l.action === task.action)
              .sort(
                (a, b) =>
                  new Date(b.logged_at).getTime() -
                  new Date(a.logged_at).getTime(),
              )[0];

            if (!lastLog) return Math.max(max, 2);

            const daysSince =
              (Date.now() - new Date(lastLog.logged_at).getTime()) /
              (1000 * 60 * 60 * 24);
            const urgency =
              daysSince > task.interval_days
                ? 2
                : daysSince > task.interval_days * 0.8
                  ? 1
                  : 0;
            return Math.max(max, urgency);
          }, 0);
        return { ...plant, maxUrgency };
      })
      .sort((a, b) => b.maxUrgency - a.maxUrgency) ?? [];
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🌿 {household.name}</h1>
          <SignOutButton />
        </div>

        <Link
          href="/plants/new"
          className="block w-full bg-green-600 text-white rounded-lg px-4 py-3 font-medium text-center"
        >
          + Add a plant
        </Link>

        <Link
          href="/household"
          className="block w-full border border-gray-300 text-gray-600 rounded-lg px-4 py-3 font-medium text-center"
        >
          Household settings
        </Link>

        <div className="space-y-4">
          {sortedPlants.length > 0 ? (
            sortedPlants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                careLogs={
                  careLogs?.filter((l) => l.plant_id === plant.id) ?? []
                }
              />
            ))
          ) : (
            <p className="text-center text-gray-400 py-8">
              No plants yet — add your first one!
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
