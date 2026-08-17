"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    console.log("SignOut component mounted");
    supabase.auth.signOut().then(() => {
      console.log("Signed out");
      document.cookie = "bloomkeeper_profile=; max-age=0; path=/";
      router.push("/login");
    });
  }, []);

  return <p>Signing out...</p>;
}
