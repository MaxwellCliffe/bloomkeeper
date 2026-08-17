"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function handleLogin() {
    setLoading(true);
    setError("");

    // Find household by trying to sign in
    // We need the email - we'll fetch it via a lookup
    const { data: household, error: lookupError } = await supabase
      .from("households")
      .select("id, name, auth_user_id")
      .limit(1)
      .single();

    if (lookupError || !household) {
      setError("No household found. Please set one up first.");
      setLoading(false);
      return;
    }

    const email = `household-test@bloomkeeper-app.com`;
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Incorrect password. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/profile-picker");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">🌿 Bloomkeeper</h1>
          <p className="text-gray-500">Enter your household password</p>
        </div>

        <div className="space-y-4">
          <input
            type="password"
            placeholder="Household password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading || !password}
            className="w-full bg-green-600 text-white rounded-lg px-4 py-3 font-medium disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500">
          New here?{" "}
          <Link href="/setup" className="text-green-600 underline">
            Create your household
          </Link>
        </p>
      </div>
    </main>
  );
}
