import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data, error } = await supabase.from("households").select("*");

  if (error) {
    return <div>Connection failed: {error.message}</div>;
  }

  return <div>Supabase connected! Households found: {data.length}</div>;
}
