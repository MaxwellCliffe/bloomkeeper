import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function PlantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: plant } = await supabase
    .from("plants")
    .select(
      `
      id,
      name,
      species,
      location,
      notes,
      photo_url,
      plant_care_tasks (
        id,
        action,
        interval_days,
        is_enabled
      )
    `,
    )
    .eq("id", id)
    .single();

  if (!plant) {
    redirect("/dashboard");
  }

  const ACTION_ICONS: Record<string, string> = {
    water: "💧",
    fertilize: "🧪",
    repot: "🪴",
    prune: "✂️",
    mist: "🌫️",
    rotate: "🔄",
  };

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-gray-500">
            ← Back
          </Link>
          <Link
            href={`/plants/${id}/edit`}
            className="text-green-600 font-medium"
          >
            Edit
          </Link>
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{plant.name}</h1>
          {plant.species && (
            <p className="text-gray-500 italic">{plant.species}</p>
          )}
          {plant.location && (
            <p className="text-gray-400">📍 {plant.location}</p>
          )}
        </div>

        {plant.notes && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">{plant.notes}</p>
          </div>
        )}

        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Care tasks</h2>
          {plant.plant_care_tasks
            .filter((t) => t.is_enabled)
            .map((task) => (
              <div
                key={task.id}
                className="border border-green-200 bg-green-50 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <span className="font-medium">
                    {ACTION_ICONS[task.action]} {task.action}
                  </span>
                  <p className="text-sm text-gray-500">
                    Every {task.interval_days} days
                  </p>
                </div>
                <button className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium">
                  Log
                </button>
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}
