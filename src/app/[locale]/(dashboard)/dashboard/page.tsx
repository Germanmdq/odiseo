import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import {
  MessageSquareText, Sparkles, Brain, Library,
  ScrollText, GraduationCap, FileText, PenLine, HelpCircle, Flame,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const QUICK_APPS = [
  { title: "Coach", desc: "Conversaciones con los maestros.", href: "/coach", icon: MessageSquareText },
  { title: "Creador de escenas", desc: "Escenas vívidas con IA.", href: "/creador-de-escenas", icon: Sparkles },
  { title: "Fuentes", desc: "Conferencias y libros.", href: "/fuentes", icon: Library },
  { title: "Diario", desc: "Tu práctica diaria escrita.", href: "/diario", icon: PenLine },
  { title: "Memoria", desc: "Todo lo que guardaste.", href: "/memoria", icon: Brain },
  { title: "Evaluar", desc: "Ponete a prueba.", href: "/preguntas", icon: HelpCircle },
]

function getSaludo(hour: number): string {
  if (hour >= 6 && hour < 13) return "Buenos días"
  if (hour >= 13 && hour < 20) return "Buenas tardes"
  return "Buenas noches"
}

function getStreakSubtitle(streak: number): string {
  if (streak === 0) return "¿Con qué querés trabajar hoy?"
  if (streak < 7) return `🔥 Llevás ${streak} ${streak === 1 ? "día" : "días"} seguidos. Seguí así.`
  return `🔥 ${streak} días de racha. Eso es compromiso real.`
}

type ActivityEvent = {
  event_date: string
  event_type: string
}

const EVENT_LABELS: Record<string, string> = {
  coach: "Usaste el Coach",
  narrador: "Creaste una escena",
  pregunta: "Te evaluaste",
  nota: "Escribiste en el Diario",
  memoria: "Guardaste una memoria",
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let nombre = "por acá"
  let streak = 0
  let recentEvents: ActivityEvent[] = []

  if (user) {
    const [profileRes, actividadRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("nombre_preferido, display_name, full_name")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("daily_activity_events")
        .select("event_date, event_type")
        .eq("user_id", user.id)
        .order("event_date", { ascending: false })
        .limit(60),
    ])

    const profile = profileRes.data
    nombre = profile?.nombre_preferido || profile?.display_name || profile?.full_name ||
      user.user_metadata?.nombre_preferido || "por acá"

    const events = actividadRes.data ?? []

    // Calculate streak
    const activeDates = new Set(events.map((e: ActivityEvent) => e.event_date))
    const today = new Date()
    for (let i = 0; i < 60; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      if (activeDates.has(key)) {
        streak++
      } else if (i > 0) {
        break
      }
    }

    // Recent events: last 4 unique dates
    const seen = new Set<string>()
    for (const ev of events) {
      if (seen.size >= 4) break
      const key = `${ev.event_date}-${ev.event_type}`
      if (!seen.has(key)) {
        seen.add(key)
        recentEvents.push(ev)
      }
    }
  }

  // Determine greeting based on Argentina time (UTC-3)
  const nowUTC = new Date()
  const hourAR = ((nowUTC.getUTCHours() - 3 + 24) % 24)
  const saludo = getSaludo(hourAR)
  const subtitulo = getStreakSubtitle(streak)

  return (
    <div className="flex-1 space-y-8 px-4 lg:px-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{saludo}, {nombre}.</h1>
        <p className="text-muted-foreground mt-1">{subtitulo}</p>
      </div>

      {/* Quick access grid */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Acceso rápido</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
          {QUICK_APPS.map((app) => (
            <Link key={app.href} href={`/${locale}${app.href}`}>
              <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <app.icon className="size-4" />
                  </div>
                  <CardTitle className="text-sm font-semibold leading-tight">{app.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <CardDescription className="text-xs">{app.desc}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {recentEvents.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Actividad reciente</h2>
          <div className="space-y-2">
            {recentEvents.map((ev, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                <Flame className="h-3.5 w-3.5 shrink-0" style={{ color: "#E8401A" }} />
                <span>{EVENT_LABELS[ev.event_type] ?? ev.event_type}</span>
                <span className="ml-auto text-xs tabular-nums">
                  {new Date(ev.event_date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Planes card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base">Tu plan personalizado</CardTitle>
              <CardDescription>Contanos tu deseo y Germán te prepara un plan a medida.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button asChild size="sm" className="cursor-pointer">
            <Link href={`/${locale}/planes`}>Solicitar mi plan</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
