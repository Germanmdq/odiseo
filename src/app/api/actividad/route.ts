import { createClient } from "@/lib/supabase/server"

const EVENT_LABELS: Record<string, string> = {
  chat: "Mensaje de Coach / Creador",
  assessment: "Te evaluaste",
  book: "Generaste un capítulo",
  note: "Escribiste una nota",
  journal: "Escribiste en el Diario",
  telegram: "Mensaje de Telegram",
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const since = new Date()
  since.setDate(since.getDate() - 364)

  const { data, error } = await supabase
    .from("daily_activity_events")
    .select("activity_date, event_type, title_es, created_at")
    .eq("user_id", user.id)
    .gte("activity_date", since.toISOString().slice(0, 10))
    .order("created_at", { ascending: false })

  if (error) {
    return Response.json({ days: [], streak: 0, recentEvents: [] })
  }

  const rows = data ?? []

  // Build set of active dates
  const activeDates = new Set(rows.map((r: { activity_date: string }) => r.activity_date))

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
    const key = `${row.activity_date}-${row.event_type}`
    if (seen.has(key)) continue
    seen.add(key)
    recentEvents.push({
      label: row.title_es || EVENT_LABELS[row.event_type] || row.event_type,
      date: row.activity_date,
      created_at: row.created_at ?? row.activity_date,
    })
    if (recentEvents.length >= 10) break
  }

  return Response.json({ days: Array.from(activeDates), streak, recentEvents })
}
