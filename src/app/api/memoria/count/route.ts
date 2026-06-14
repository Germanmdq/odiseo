import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ count: 0 })

  const admin = createAdminClient()
  const { count, error } = await admin
    .from("memoria")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "active")

  if (error) return Response.json({ count: 0 })
  return Response.json({ count: count ?? 0 })
}
