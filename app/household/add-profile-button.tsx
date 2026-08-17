"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

const AVATAR_COLORS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
];

export default function AddProfileButton({
  householdId,
}: {
  householdId: string;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function handleAdd() {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await supabase.from("profiles").insert({
      household_id: householdId,
      display_name: name.trim(),
      avatar_color: color,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setName("");
    setColor(AVATAR_COLORS[0]);
    setAdding(false);
    setLoading(false);
    router.refresh();
  }

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 text-gray-500 font-medium hover:border-green-400 hover:text-green-600 transition-colors"
      >
        + Add family member
      </button>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h3 className="font-semibold">New family member</h3>

      <input
        type="text"
        placeholder="Their name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <div className="space-y-2">
        <p className="text-sm text-gray-500">Avatar color</p>
        <div className="flex gap-2">
          {AVATAR_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${
                color === c ? "border-gray-800 scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={() => setAdding(false)}
          className="flex-1 border rounded-lg px-4 py-2 text-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={handleAdd}
          disabled={loading || !name}
          className="flex-1 bg-green-600 text-white rounded-lg px-4 py-2 font-medium disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>
    </div>
  );
}
