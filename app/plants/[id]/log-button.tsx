"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

type LogButtonProps = {
  plantId: string;
  action: string;
};

export default function LogButton({ plantId, action }: LogButtonProps) {
  const [loading, setLoading] = useState(false);
  const [logged, setLogged] = useState(false);
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  function getProfileId() {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith("bloomkeeper_profile="));
    return match ? match.split("=")[1] : null;
  }

  async function handleLog() {
    const profileId = getProfileId();

    if (!profileId) {
      alert("Please select a profile first.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("care_logs").insert({
      plant_id: plantId,
      profile_id: profileId,
      action: action,
    });

    if (error) {
      alert("Failed to log action.");
      setLoading(false);
      return;
    }
    setLogged(true);
    setLoading(false);
    router.refresh();

    setTimeout(() => setLogged(false), 3000);
  }

  return (
    <button
      onClick={handleLog}
      disabled={loading}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        logged ? "bg-green-100 text-green-700" : "bg-green-600 text-white"
      }`}
    >
      {loading ? "..." : logged ? "✓ Done" : "Log"}
    </button>
  );
}
