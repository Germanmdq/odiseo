import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"

export async function registrarActividad({
  userId,
  eventType,
  titleEs,
  metadata = {},
}: {
  userId: string
  eventType: string
  titleEs: string
  metadata?: Record<string, unknown>
}) {
  const supabase = createAdminClient()
  await supabase.from("daily_activity_events").insert({
    user_id: userId,
    activity_date: new Date().toISOString().split("T")[0],
    event_type: eventType,
    title_es: titleEs,
    locale: "es",
    metadata,
  })
}
