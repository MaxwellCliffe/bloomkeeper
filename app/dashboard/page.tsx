import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import SignOutButton from "./signout-button";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: household } = await supabase
    .from("households")
    .select("name")
    .single();

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-sm mx-auto space-y-4">
        <h1 className="text-2xl font-bold">🌿 {household?.name}</h1>
        <p className="text-gray-500">Welcome to your dashboard!</p>
        <SignOutButton />
      </div>
    </main>
  );
}
