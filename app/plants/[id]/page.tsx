import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogButton from "./log-button";

const ACTION_ICONS: Record<string, string> = {
  water: "💧",
  fertilize: "🧪",
  repot: "🪴",
  prune: "✂️",
  mist: "🌫️",
  rotate: "🔄",
};

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

  const { data: careLogs } = await supabase
    .from("care_logs")
    .select(
      `
      id,
      action,
      note,
      logged_at,
      profiles (
        display_name,
        avatar_color
      )
    `,
    )
    .eq("plant_id", id)
    .order("logged_at", { ascending: false })
    .limit(20);

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
                <LogButton plantId={plant.id} action={task.action} />
              </div>
            ))}
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold text-lg">History</h2>
          {careLogs && careLogs.length > 0 ? (
            careLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 py-3 border-b last:border-0"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{
                    backgroundColor:
                      (log.profiles as any)?.avatar_color || "#6366f1",
                  }}
                >
                  {(log.profiles as any)?.display_name?.[0]?.toUpperCase()}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {ACTION_ICONS[log.action] || "📝"} {log.action}
                    {" · "}
                    <span className="text-gray-500 font-normal">
                      {(log.profiles as any)?.display_name}
                    </span>
                  </p>
                  {log.note && (
                    <p className="text-sm text-gray-500">{log.note}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {new Date(log.logged_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No history yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
