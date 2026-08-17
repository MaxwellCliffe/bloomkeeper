"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CARE_ACTIONS } from "@/lib/constants";

export default function NewPlantPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [careTasks, setCareTasks] = useState(
    CARE_ACTIONS.map((a) => ({
      action: a.action,
      label: a.label,
      icon: a.icon,
      interval_days: a.defaultInterval,
      is_enabled: a.enabledByDefault,
    })),
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
        t.action === action ? { ...t, interval_days: value as any } : t,
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

    const { data: household } = await supabase
      .from("households")
      .select("id")
      .single();

    if (!household) {
      setError("Could not find household.");
      setLoading(false);
      return;
    }

    const { data: plant, error: plantError } = await supabase
      .from("plants")
      .insert({
        household_id: household.id,
        name: name.trim(),
        species: species.trim() || null,
        location: location.trim() || null,
        notes: notes.trim() || null,
      })
      .select("id")
      .single();

    if (plantError || !plant) {
      setError("Failed to create plant. Please try again.");
      setLoading(false);
      return;
    }

    const taskRows = careTasks.map((t) => ({
      plant_id: plant.id,
      action: t.action,
      interval_days: t.interval_days,
      is_enabled: t.is_enabled,
    }));

    const { error: tasksError } = await supabase
      .from("plant_care_tasks")
      .insert(taskRows);

    if (tasksError) {
      setError("Plant created but failed to save care tasks.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-500">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold">Add a plant</h1>
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
          {loading ? "Saving..." : "Add plant"}
        </button>
      </div>
    </main>
  );
}
