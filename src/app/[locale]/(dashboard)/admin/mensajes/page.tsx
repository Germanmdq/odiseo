import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { AdminMensajesView } from "./components/admin-mensajes-view"

export default async function AdminMensajesPage({
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
  
  // Obtener todos los mensajes agrupados por usuario
  const { data: mensajes } = await admin
    .from("mensajes")
    .select("*")
    .order("created_at", { ascending: true })

  // Obtener lista de usuarios únicos
  const userIds = [...new Set(mensajes?.map(m => m.user_id) ?? [])]
  
  const usersData = await Promise.all(
    userIds.map(id => admin.auth.admin.getUserById(id))
  )
  
  const users = usersData.map(r => r.data?.user).filter((u): u is NonNullable<typeof u> => !!u)

  return <AdminMensajesView mensajes={mensajes ?? []} users={users} />
}
