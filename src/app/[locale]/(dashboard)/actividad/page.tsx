"use client"

import type { ComponentProps } from "react"
import { useEffect, useState } from "react"
import { Flame } from "lucide-react"
import { es } from "date-fns/locale"

import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { PersonalSubtitle } from "@/components/personal-subtitle"

const ACTIVE_COLOR = "#E8401A"

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

function selectedDateKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

function ActivityDayButton(props: ComponentProps<typeof CalendarDayButton>) {
  const { children, modifiers, ...rest } = props
  const hasActivity = !!(modifiers as Record<string, boolean>).hasActivity
  return (
    <CalendarDayButton modifiers={modifiers} {...rest}>
      {children}
      {hasActivity && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            backgroundColor: ACTIVE_COLOR,
            display: "block",
            flexShrink: 0,
          }}
        />
      )}
    </CalendarDayButton>
  )
}

type RecentEvent = { label: string; date: string; created_at: string }

export default function ActividadPage() {
  const [activeDays, setActiveDays] = useState<Set<string>>(new Set())
  const [streak, setStreak] = useState(0)
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)

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

  const activeDates = Array.from(activeDays).map(d => new Date(d + "T12:00:00"))

  const selectedKey = selectedDay ? selectedDateKey(selectedDay) : null
  const visibleEvents = selectedKey
    ? recentEvents.filter(ev => ev.created_at.slice(0, 10) === selectedKey)
    : recentEvents

  return (
    <div className="mx-auto w-full max-w-5xl px-4 lg:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mi actividad</h1>
        <PersonalSubtitle
          className="text-muted-foreground text-sm"
          conNombre="{nombre}, los días con punto naranja son los que practicaste."
          sinNombre="Los días con punto naranja son los que practicaste."
        />
      </div>

      <div className="flex flex-col gap-5 md:grid md:grid-cols-[auto_1fr] md:gap-8 md:items-start">
        {/* Columna izquierda: Calendar */}
        <div className="w-full shrink-0 md:sticky md:top-6 md:w-auto">
          {loading ? (
            <div className="mx-auto flex h-64 w-[268px] items-center justify-center rounded-2xl border border-black/10 bg-card text-sm text-muted-foreground shadow-[0_8px_28px_rgba(0,0,0,0.08)] md:mx-0">
              Cargando...
            </div>
          ) : (
            <div className="mx-auto w-fit rounded-2xl border border-black/10 bg-card p-2 shadow-[0_8px_28px_rgba(0,0,0,0.08)] md:mx-0">
              <Calendar
                mode="single"
                selected={selectedDay}
                onSelect={d =>
                  setSelectedDay(d?.toDateString() === selectedDay?.toDateString() ? undefined : d)
                }
                locale={es}
                modifiers={{ hasActivity: activeDates }}
                components={{ DayButton: ActivityDayButton }}
              />
              {selectedDay && (
                <div className="flex items-center justify-between px-2 pb-1 text-xs text-muted-foreground border-t mt-2 pt-2">
                  <span className="capitalize">
                    {selectedDay.toLocaleDateString("es-AR", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedDay(undefined)}
                    className="hover:text-foreground cursor-pointer"
                  >
                    Ver todo
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Columna derecha: racha + actividad */}
        <div className="min-w-0 space-y-6">
          {/* Racha */}
          {streak > 0 && (
            <div
              className="flex items-center gap-2 rounded-2xl border border-black/10 bg-card p-4 text-lg font-semibold shadow-[0_8px_28px_rgba(0,0,0,0.08)]"
              style={{ color: ACTIVE_COLOR }}
            >
              <Flame className="h-6 w-6" />
              <span>{streak} {streak === 1 ? "día" : "días"} de racha</span>
            </div>
          )}

          {/* Actividad reciente */}
          <div className="rounded-2xl border border-black/10 bg-card p-4 shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {selectedDay
                ? selectedDay.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
                : "Actividad reciente"}
            </h2>
            {loading ? (
              <p className="text-sm text-muted-foreground">Cargando...</p>
            ) : visibleEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedDay
                  ? "Sin actividad registrada este día."
                  : "Todavía no registramos actividad. Usá el Coach, el Diario o Evaluación para que aparezca acá."}
              </p>
            ) : (
              <div className="space-y-3">
                {visibleEvents.map((ev, i) => (
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
      </div>
    </div>
  )
}
