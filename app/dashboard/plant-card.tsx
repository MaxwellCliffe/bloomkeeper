"use client";

import Link from "next/link";

const URGENCY_COLORS = {
  0: "bg-green-100 text-green-700",
  1: "bg-amber-100 text-amber-700",
  2: "bg-red-100 text-red-700",
};

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

type Plant = {
  id: string;
  name: string;
  species: string | null;
  location: string | null;
  photo_url: string | null;
  plant_care_tasks: CareTask[];
};

export default function PlantCard({ plant }: { plant: Plant }) {
  const enabledTasks = plant.plant_care_tasks.filter((t) => t.is_enabled);
  const disabledTasks = plant.plant_care_tasks.filter((t) => !t.is_enabled);

  return (
    <Link href={`/plants/${plant.id}`}>
      <div className="border rounded-xl p-4 space-y-3 hover:border-green-400 transition-colors">
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
          {enabledTasks.map((task) => (
            <span
              key={task.id}
              className={`px-2 py-1 rounded-full text-xs font-medium ${URGENCY_COLORS[0]}`}
            >
              {ACTION_ICONS[task.action]} {task.action}
            </span>
          ))}
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
