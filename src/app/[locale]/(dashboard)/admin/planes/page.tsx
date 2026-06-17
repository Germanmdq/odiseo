import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { AdminPlanesView } from "./components/admin-planes-view"

export default async function AdminPlanesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user?.email !== "germangonzalezmdq@gmail.com") {
    redirect("/")
  }

  const admin = createAdminClient()
  const { data: solicitudes } = await admin
    .from("plan_solicitudes")
    .select("*")
    .order("created_at", { ascending: false })

  return <AdminPlanesView solicitudes={solicitudes ?? []} />
}
