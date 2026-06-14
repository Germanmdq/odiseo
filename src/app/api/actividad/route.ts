import { createClient } from "@/lib/supabase/server"

const EVENT_LABELS: Record<string, string> = {
  coach: "Usaste el Coach",
  narrador: "Creaste una escena",
  pregunta: "Te evaluaste",
  nota: "Escribiste en el Diario",
  memoria: "Guardaste una memoria",
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const since = new Date()
  since.setDate(since.getDate() - 364)

  const { data, error } = await supabase
    .from("daily_activity_events")
    .select("event_date, event_type, created_at")
    .eq("user_id", user.id)
    .gte("event_date", since.toISOString().slice(0, 10))
    .order("created_at", { ascending: false })

  if (error) {
    return Response.json({ days: [], streak: 0, recentEvents: [] })
  }

  const rows = data ?? []

  // Build set of active dates
  const activeDates = new Set(rows.map((r: { event_date: string }) => r.event_date))

  // Calculate current streak (consecutive days backwards from today)
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if (activeDates.has(key)) {
      streak++
    } else if (i > 0) {
      break
    }
  }

  // Recent events — deduplicate by type+date, latest first, up to 10
  const recentEvents: Array<{ label: string; date: string; created_at: string }> = []
  const seen = new Set<string>()
  for (const row of rows) {
    const key = `${row.event_date}-${row.event_type}`
    if (seen.has(key)) continue
    seen.add(key)
    recentEvents.push({
      label: EVENT_LABELS[row.event_type] ?? row.event_type,
      date: row.event_date,
      created_at: row.created_at ?? row.event_date,
    })
    if (recentEvents.length >= 10) break
  }

  return Response.json({ days: Array.from(activeDates), streak, recentEvents })
}
