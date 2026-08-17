"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function ProfilePickerPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function loadProfiles() {
      const { data: household } = await supabase
        .from("households")
        .select("id")
        .single();

      if (!household) return;

      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_color")
        .eq("household_id", household.id)
        .eq("is_active", true);

      setProfiles(data || []);
      setLoading(false);
    }

    loadProfiles();
  }, []);

  function selectProfile(profileId: string) {
    document.cookie = `bloomkeeper_profile=${profileId}; path=/; max-age=2592000`;
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading profiles...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">🌿 Bloomkeeper</h1>
          <p className="text-gray-500">Who's watering today?</p>
        </div>

        <div className="space-y-3">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => selectProfile(profile.id)}
              className="w-full flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                style={{ backgroundColor: profile.avatar_color }}
              >
                {profile.display_name[0].toUpperCase()}
              </div>
              <span className="text-lg font-medium">
                {profile.display_name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
