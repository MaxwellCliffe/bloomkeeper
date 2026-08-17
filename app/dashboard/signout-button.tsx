"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function handleSignOut() {
    console.log("Signing out...");
    await supabase.auth.signOut();
    document.cookie = "bloomkeeper_profile=; max-age=0; path=/";
    router.push("/login");
  }

  return (
    <button onClick={handleSignOut} className="text-red-500 text-sm">
      Sign out
    </button>
  );
}
