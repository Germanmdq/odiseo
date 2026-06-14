"use client"

import { useEffect, useState } from "react"
import { Flame } from "lucide-react"

const ACTIVE_COLOR = "#E8401A"

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function build30Days(): string[] {
  const days: string[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(getDateKey(d))
  }
  return days
}

function formatRelativa(iso: string) {
  const now = Date.now()
  const diff = now - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Ahora mismo"
  if (mins < 60) return `Hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs} h`
  const days = Math.floor(hrs / 24)
  if (days === 1) return "Ayer"
  if (days < 7) return `Hace ${days} días`
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short" })
}

type RecentEvent = { label: string; date: string; created_at: string }

export default function ActividadPage() {
  const [activeDays, setActiveDays] = useState<Set<string>>(new Set())
  const [streak, setStreak] = useState(0)
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/actividad")
      .then(r => r.json())
      .then(d => {
        setActiveDays(new Set(d.days ?? []))
        setStreak(d.streak ?? 0)
        setRecentEvents(d.recentEvents ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const days30 = build30Days()
  const todayKey = getDateKey(new Date())

  return (
    <div className="space-y-8 px-4 lg:px-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mi actividad</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Cada cuadrado es un día que practicaste en Odiseo.
          </p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 shrink-0 font-semibold text-sm" style={{ color: ACTIVE_COLOR }}>
            <Flame className="h-5 w-5" />
            <span>{streak} {streak === 1 ? "día" : "días"} de racha</span>
          </div>
        )}
      </div>

      {/* 30-day compact grid */}
      {loading ? (
        <div className="h-20 flex items-center text-muted-foreground text-sm">Cargando...</div>
      ) : (
        <div>
          <div className="flex flex-wrap gap-1.5">
            {days30.map(day => {
              const isActive = activeDays.has(day)
              const isToday = day === todayKey
              return (
                <div
                  key={day}
                  title={day}
                  className="w-6 h-6 rounded-sm transition-opacity"
                  style={{
                    backgroundColor: isActive ? ACTIVE_COLOR : "hsl(var(--muted))",
                    opacity: isActive ? 1 : 0.45,
                    outline: isToday ? `2px solid ${ACTIVE_COLOR}` : undefined,
                    outlineOffset: isToday ? "2px" : undefined,
                  }}
                />
              )
            })}
          </div>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
            <span>Menos</span>
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(var(--muted))", opacity: 0.45 }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ACTIVE_COLOR, opacity: 0.4 }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ACTIVE_COLOR, opacity: 0.7 }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ACTIVE_COLOR }} />
            <span>Más</span>
          </div>
        </div>
      )}

      {/* Actividad reciente */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Actividad reciente
        </h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : recentEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground leading-relaxed">
            Todavía no registramos actividad. Usá el Coach, el Diario o Evaluación para que aparezca acá.
          </p>
        ) : (
          <div className="space-y-3">
            {recentEvents.map((ev, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: ACTIVE_COLOR }}
                />
                <span className="flex-1 text-foreground/80">{ev.label}</span>
                <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                  {formatRelativa(ev.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
