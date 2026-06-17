import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ count: 0 })

  const admin = createAdminClient()
  const { count, error } = await admin
    .from("plan_solicitudes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "respondido")

  if (error) return NextResponse.json({ count: 0 })
  return NextResponse.json({ count: count ?? 0 })
}
