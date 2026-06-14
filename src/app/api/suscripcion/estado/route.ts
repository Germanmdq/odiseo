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
    .select("plan_id, status, current_period_end, incluye_talleres, pasarela")
    .eq("user_id", user.id)
    .maybeSingle()

  const suscripto =
    sub?.status === "active" &&
    sub?.current_period_end != null &&
    new Date(sub.current_period_end as string) > new Date()

  if (!suscripto) {
    return NextResponse.json({ suscripto: false, plan: null })
  }

  return NextResponse.json({
    suscripto: true,
    plan: sub.plan_id,
    currentPeriodEnd: sub.current_period_end,
    pasarela: sub.pasarela,
    incluye_talleres: sub.incluye_talleres,
  })
}
