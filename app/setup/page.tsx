"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SetupPage() {
  const [householdName, setHouseholdName] = useState("");
  const [profileName, setProfileName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function handleSetup() {
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!householdName.trim() || !profileName.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    // Generate a UUID for the household
    const householdId = crypto.randomUUID();
    const email = `household-${householdId}@bloomkeeper-app.com`;

    // Create the Supabase Auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      setError(authError?.message || "No user returned from auth");
      setLoading(false);
      return;
    }

    // Create the household row
    const { error: householdError } = await supabase.from("households").insert({
      id: householdId,
      name: householdName.trim(),
      auth_user_id: authData.user.id,
    });

    if (householdError) {
      setError("Failed to save household. Please try again.");
      setLoading(false);
      return;
    }

    // Create the first profile
    const { error: profileError } = await supabase.from("profiles").insert({
      household_id: householdId,
      display_name: profileName.trim(),
    });

    if (profileError) {
      setError("Failed to create profile. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">🌿 Bloomkeeper</h1>
          <p className="text-gray-500">Create your household</p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Household name (e.g. The Garcias)"
            value={householdName}
            onChange={(e) => setHouseholdName(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            type="text"
            placeholder="Your name (e.g. Mom, Jake)"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            type="password"
            placeholder="Choose a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleSetup}
            disabled={
              loading ||
              !householdName ||
              !profileName ||
              !password ||
              !confirmPassword
            }
            className="w-full bg-green-600 text-white rounded-lg px-4 py-3 font-medium disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create household"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500">
          Already have a household?{" "}
          <Link href="/login" className="text-green-600 underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
