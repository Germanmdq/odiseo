import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { ADMIN_EMAIL } from "@/lib/acceso"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ suscripto: false, plan: null }, { status: 200 })

  // Admin: acceso ilimitado hardcodeado (no depende de una fila en subscriptions)
  if (user.email === ADMIN_EMAIL) {
    return NextResponse.json({ suscripto: true, plan: "admin", esAdmin: true })
  }

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

