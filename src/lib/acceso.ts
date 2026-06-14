import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

export type AccesoResult = {
  allowed: boolean
  suscripto: boolean
  plan: string | null
  incluye_talleres: boolean
  usosRestantes: number | null
}

export async function checkAccess(userId: string): Promise<AccesoResult> {
  const admin = createAdminClient()

  // 1. Check active subscription
  const { data: sub } = await admin
    .from("subscriptions")
    .select("plan_id, status, current_period_end, incluye_talleres")
    .eq("user_id", userId)
    .maybeSingle()

  const suscripto =
    sub?.status === "active" &&
    sub?.current_period_end != null &&
    new Date(sub.current_period_end as string) > new Date()

  if (suscripto) {
    return {
      allowed: true,
      suscripto: true,
      plan: sub.plan_id as string,
      incluye_talleres: sub.incluye_talleres as boolean,
      usosRestantes: null,
    }
  }

  // 2. New strategy: first session of the day is free.
  // If user has ANY usage from a previous day → paywall.
  try {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const { count } = await admin
      .from("user_usage")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .lt("created_at", startOfToday.toISOString())

    const hadPreviousSession = (count ?? 0) > 0

    return {
      allowed: !hadPreviousSession,
      suscripto: false,
      plan: null,
      incluye_talleres: false,
      usosRestantes: hadPreviousSession ? 0 : null,
    }
  } catch {
    // Table doesn't exist yet — grant access
    return {
      allowed: true,
      suscripto: false,
      plan: null,
      incluye_talleres: false,
      usosRestantes: null,
    }
  }
}
