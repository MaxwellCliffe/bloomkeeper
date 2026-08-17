"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CARE_ACTIONS } from "@/lib/constants";

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
  notes: string | null;
  photo_url: string | null;
  plant_care_tasks: CareTask[];
};

export default function EditPlantForm({ plant }: { plant: Plant }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  // Pre-populated with existing plant data
  const [name, setName] = useState(plant.name);
  const [species, setSpecies] = useState(plant.species || "");
  const [location, setLocation] = useState(plant.location || "");
  const [notes, setNotes] = useState(plant.notes || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [careTasks, setCareTasks] = useState(
    CARE_ACTIONS.map((a) => {
      const existing = plant.plant_care_tasks.find(
        (t) => t.action === a.action,
      );
      return {
        action: a.action,
        label: a.label,
        icon: a.icon,
        interval_days: existing?.interval_days ?? a.defaultInterval,
        is_enabled: existing?.is_enabled ?? a.enabledByDefault,
      };
    }),
  );

  function toggleTask(action: string) {
    setCareTasks((prev) =>
      prev.map((t) =>
        t.action === action ? { ...t, is_enabled: !t.is_enabled } : t,
      ),
    );
  }

  function updateInterval(action: string, value: number) {
    setCareTasks((prev) =>
      prev.map((t) =>
        t.action === action ? { ...t, interval_days: value } : t,
      ),
    );
  }

  async function handleSubmit() {
    if (!name.trim()) {
      setError("Plant name is required.");
      return;
    }

    setLoading(true);
    setError("");

    const { error: plantError } = await supabase
      .from("plants")
      .update({
        name: name.trim(),
        species: species.trim() || null,
        location: location.trim() || null,
        notes: notes.trim() || null,
      })
      .eq("id", plant.id);

    if (plantError) {
      setError("Failed to update plant.");
      setLoading(false);
      return;
    }

    for (const task of careTasks) {
      await supabase
        .from("plant_care_tasks")
        .update({
          interval_days: task.interval_days,
          is_enabled: task.is_enabled,
        })
        .eq("plant_id", plant.id)
        .eq("action", task.action);
    }

    router.push(`/plants/${plant.id}`);
  }

  async function handleDelete() {
    if (!confirm("Delete this plant? This cannot be undone.")) return;

    const { error } = await supabase.from("plants").delete().eq("id", plant.id);

    if (error) {
      setError("Failed to delete plant.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href={`/plants/${plant.id}`} className="text-gray-500">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold">Edit plant</h1>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Plant name (required)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            placeholder="Species (optional)"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            placeholder="Location (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <textarea
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Care tasks</h2>
          {careTasks.map((task) => (
            <div
              key={task.action}
              className={`border rounded-lg p-4 space-y-3 ${task.is_enabled ? "border-green-400 bg-green-50" : "border-gray-200 opacity-60"}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {task.icon} {task.label}
                </span>
                <button
                  onClick={() => toggleTask(task.action)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${task.is_enabled ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"}`}
                >
                  {task.is_enabled ? "On" : "Off"}
                </button>
              </div>
              {task.is_enabled && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Every</span>
                  <input
                    type="number"
                    min={1}
                    value={task.interval_days}
                    onChange={(e) =>
                      updateInterval(task.action, parseInt(e.target.value) || 1)
                    }
                    className="w-20 border rounded px-2 py-1 text-center"
                  />
                  <span className="text-sm text-gray-500">days</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading || !name}
          className="w-full bg-green-600 text-white rounded-lg px-4 py-3 font-medium disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save changes"}
        </button>

        <button
          onClick={handleDelete}
          className="w-full border border-red-300 text-red-500 rounded-lg px-4 py-3 font-medium"
        >
          Delete plant
        </button>
      </div>
    </main>
  );
}
