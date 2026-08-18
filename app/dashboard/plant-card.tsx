"use client";

import Link from "next/link";

const ACTION_ICONS: Record<string, string> = {
  water: "💧",
  fertilize: "🧪",
  repot: "🪴",
  prune: "✂️",
  mist: "🌫️",
  rotate: "🔄",
};

type CareTask = {
  id: string;
  action: string;
  interval_days: number;
  is_enabled: boolean;
};

type CareLog = {
  action: string;
  logged_at: string;
};

type Plant = {
  id: string;
  name: string;
  species: string | null;
  location: string | null;
  photo_url: string | null;
  plant_care_tasks: CareTask[];
  care_logs?: CareLog[];
};

function getUrgency(task: CareTask, logs: CareLog[]): 0 | 1 | 2 {
  const lastLog = logs
    .filter((l) => l.action === task.action)
    .sort(
      (a, b) =>
        new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime(),
    )[0];

  if (!lastLog) return 2;

  const daysSince =
    (Date.now() - new Date(lastLog.logged_at).getTime()) /
    (1000 * 60 * 60 * 24);

  if (daysSince > task.interval_days) return 2;
  if (daysSince > task.interval_days * 0.8) return 1;
  return 0;
}

const URGENCY_COLORS: Record<number, string> = {
  0: "bg-green-100 text-green-700",
  1: "bg-amber-100 text-amber-700",
  2: "bg-red-100 text-red-700",
};

export default function PlantCard({ plant }: { plant: Plant }) {
  console.log("care_logs for", plant.name, plant.care_logs);
  const enabledTasks = plant.plant_care_tasks.filter((t) => t.is_enabled);
  const disabledTasks = plant.plant_care_tasks.filter((t) => !t.is_enabled);

  const maxUrgency = enabledTasks.reduce((max, task) => {
    return Math.max(max, getUrgency(task, plant.care_logs ?? []));
  }, 0);

  return (
    <Link href={`/plants/${plant.id}`}>
      <div
        className={`border rounded-xl p-4 space-y-3 hover:border-green-400 transition-colors ${
          maxUrgency === 2
            ? "border-red-200"
            : maxUrgency === 1
              ? "border-amber-200"
              : "border-gray-200"
        }`}
      >
        <div className="space-y-1">
          <h2 className="font-semibold text-lg">{plant.name}</h2>
          {plant.species && (
            <p className="text-sm text-gray-500 italic">{plant.species}</p>
          )}
          {plant.location && (
            <p className="text-sm text-gray-400">📍 {plant.location}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {enabledTasks.map((task) => {
            const urgency = getUrgency(task, plant.care_logs ?? []);
            return (
              <span
                key={task.id}
                className={`px-2 py-1 rounded-full text-xs font-medium ${URGENCY_COLORS[urgency]}`}
              >
                {ACTION_ICONS[task.action]} {task.action}
              </span>
            );
          })}
          {disabledTasks.map((task) => (
            <span
              key={task.id}
              className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-400"
            >
              {ACTION_ICONS[task.action]}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
