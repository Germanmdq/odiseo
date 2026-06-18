import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ suscripto: false, plan: null }, { status: 200 })

  const admin = createAdminClient()
  const { data: sub } = await admin
    .from("subscriptions")
    .select("plan, status, expires_at, gateway")
    .eq("user_id", user.id)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!sub) {
    return NextResponse.json({ suscripto: false, plan: null })
  }

  return NextResponse.json({
    suscripto: true,
    plan: sub.plan,
    currentPeriodEnd: sub.expires_at,
    pasarela: sub.gateway,
    incluye_talleres: sub.plan === "anual",
  })
}

