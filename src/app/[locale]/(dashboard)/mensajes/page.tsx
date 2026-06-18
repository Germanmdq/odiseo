import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { MensajesView } from "./components/mensajes-view"

export default async function MensajesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/${locale}/login`)
  }

  const admin = createAdminClient()
  const { data: solicitudes } = await admin
    .from("plan_solicitudes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const allSolicitudes = solicitudes || []
  
  // Separamos planes respondidos de solicitudes pendientes
  const planes = allSolicitudes.filter(p => p.status === "respondido")
  const pendientes = allSolicitudes.filter(p => p.status === "pendiente")

  return (
    <MensajesView 
      planes={planes} 
      pendientes={pendientes} 
      locale={locale} 
    />
  )
}
