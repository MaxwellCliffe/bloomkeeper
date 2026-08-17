import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import AddProfileButton from "./add-profile-button";

export default async function HouseholdPage() {
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

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_color, is_active")
    .eq("household_id", household.id)
    .order("created_at", { ascending: true });

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-500">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold">Household</h1>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Household name</p>
          <p className="font-semibold text-lg">{household.name}</p>
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Members</h2>
          {profiles?.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center gap-3 p-3 border rounded-lg"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                style={{ backgroundColor: profile.avatar_color }}
              >
                {profile.display_name[0].toUpperCase()}
              </div>
              <span className="font-medium">{profile.display_name}</span>
              {!profile.is_active && (
                <span className="ml-auto text-xs text-gray-400">inactive</span>
              )}
            </div>
          ))}
        </div>

        <AddProfileButton householdId={household.id} />
      </div>
    </main>
  );
}
