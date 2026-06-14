import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  // Get last 365 days of activity
  const since = new Date()
  since.setDate(since.getDate() - 364)

  const { data, error } = await supabase
    .from("daily_activity_events")
    .select("event_date, event_type")
    .eq("user_id", user.id)
    .gte("event_date", since.toISOString().slice(0, 10))
    .order("event_date", { ascending: true })

  if (error) {
    // Table may not exist yet — return empty
    return Response.json({ days: [], streak: 0 })
  }

  // Build set of active dates
  const activeDates = new Set((data ?? []).map((r: { event_date: string }) => r.event_date))

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

  return Response.json({ days: Array.from(activeDates), streak })
}
