import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { PLANES, calcularPeriodEnd, type PlanId } from "@/lib/planes"

export async function activarSuscripcion(
  userId: string,
  planId: PlanId,
  pasarela: "mercadopago" | "paypal",
  pasarelaId: string
) {
  const plan = PLANES[planId]
  const periodEnd = calcularPeriodEnd(plan.periodo)

  const admin = createAdminClient()
  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      plan_id: planId,
      status: "active",
      pasarela,
      pasarela_subscription_id: pasarelaId,
      current_period_end: periodEnd,
      incluye_talleres: plan.incluye_talleres,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  )

  if (error) throw new Error(`activarSuscripcion failed: ${error.message}`)
}
