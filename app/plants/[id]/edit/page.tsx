import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import EditPlantForm from "./edit-form";

export default async function EditPlantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: plant } = await supabase
    .from("plants")
    .select(
      `
      id,
      name,
      species,
      location,
      notes,
      photo_url,
      plant_care_tasks (
        id,
        action,
        interval_days,
        is_enabled
      )
    `,
    )
    .eq("id", id)
    .single();

  if (!plant) {
    redirect("/dashboard");
  }

  return <EditPlantForm plant={plant} />;
}
