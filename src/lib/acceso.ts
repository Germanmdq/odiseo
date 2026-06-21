import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"

// Email con acceso ilimitado hardcodeado (admin). Fuente única de verdad,
// usada por checkAccess y por /api/suscripcion/estado.
export const ADMIN_EMAIL = "germangonzalezmdq@gmail.com"

export async function checkAccess(userId: string): Promise<{ allowed: boolean; plan: string | null }> {
  const admin = createAdminClient()

  // Germán siempre tiene acceso ilimitado
  const { data: userData } = await admin.auth.admin.getUserById(userId)
  if (userData?.user?.email === ADMIN_EMAIL) {
    return { allowed: true, plan: "anual" }
  }

  // 1. Tiene suscripción activa → acceso ilimitado
  const { data: sub } = await admin
    .from("subscriptions")
    .select("plan, expires_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (sub) return { allowed: true, plan: sub.plan }

  // 2. Sin suscripción → contar solo usos de IA en daily_activity_events
  const { count } = await admin
    .from("daily_activity_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("event_type", ["coach_message", "escena_creada", "assessment", "book"])

  // 3 usos gratis totales, después paywall
  if (!count || count < 3) return { allowed: true, plan: null }

  return { allowed: false, plan: null }
}

export async function activarSuscripcion({
  userId,
  plan,
  gateway,
  externalId,
  amount,
  currency,
}: {
  userId: string
  plan: string
  gateway: string
  externalId: string
  amount: number
  currency: string
}) {
  const admin = createAdminClient()
  
  const now = new Date()
  const expires = new Date(now)
  
  if (plan === "semanal") expires.setDate(expires.getDate() + 7)
  else if (plan === "mensual") expires.setMonth(expires.getMonth() + 1)
  else if (plan === "anual") expires.setFullYear(expires.getFullYear() + 1)

  await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      plan,
      gateway,
      status: "active",
      external_id: externalId,
      amount,
      currency,
      starts_at: now.toISOString(),
      expires_at: expires.toISOString(),
    },
    { onConflict: "external_id" }
  )
}
