"use client"

import { useEffect, useState } from "react"
import { Flame } from "lucide-react"

const ACTIVE_COLOR = "#E8401A"
const INACTIVE_COLOR = "hsl(var(--muted))"
const WEEKS = 52

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function buildGrid() {
  const today = new Date()
  // Start from the Sunday 52 weeks ago
  const start = new Date(today)
  start.setDate(today.getDate() - WEEKS * 7 + 1)
  // Align to Sunday
  start.setDate(start.getDate() - start.getDay())

  const weeks: string[][] = []
  const cursor = new Date(start)
  for (let w = 0; w < WEEKS; w++) {
    const week: string[] = []
    for (let d = 0; d < 7; d++) {
      week.push(getDateKey(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

export default function ActividadPage() {
  const [activeDays, setActiveDays] = useState<Set<string>>(new Set())
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/actividad")
      .then(r => r.json())
      .then(d => {
        setActiveDays(new Set(d.days ?? []))
        setStreak(d.streak ?? 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const grid = buildGrid()

  // Month labels: find first week where month changes
  const monthPositions: { label: string; col: number }[] = []
  grid.forEach((week, i) => {
    const month = new Date(week[0]).getMonth()
    if (i === 0 || new Date(grid[i - 1][0]).getMonth() !== month) {
      monthPositions.push({ label: MONTH_LABELS[month], col: i })
    }
  })

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold">Mi actividad</h1>
        <p className="text-muted-foreground">Días que practicaste en Odiseo.</p>
      </div>

      {/* Streak */}
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Flame className="h-5 w-5" style={{ color: ACTIVE_COLOR }} />
        <span>
          Racha actual: <span style={{ color: ACTIVE_COLOR }}>{streak} {streak === 1 ? "día" : "días"}</span>
        </span>
      </div>

      {loading ? (
        <div className="h-32 flex items-center text-muted-foreground text-sm">Cargando...</div>
      ) : (
        <div className="overflow-x-auto">
          <div className="inline-block">
            {/* Month labels */}
            <div className="flex mb-1 ml-8">
              {grid.map((_, i) => {
                const mp = monthPositions.find(m => m.col === i)
                return (
                  <div key={i} className="w-3.5 text-[10px] text-muted-foreground shrink-0">
                    {mp ? mp.label : ""}
                  </div>
                )
              })}
            </div>

            <div className="flex gap-0.5">
              {/* Day labels */}
              <div className="flex flex-col gap-0.5 mr-1 pt-0">
                {["D", "L", "M", "X", "J", "V", "S"].map((d, i) => (
                  <div key={i} className="h-3.5 text-[10px] text-muted-foreground flex items-center">
                    {i % 2 === 1 ? d : ""}
                  </div>
                ))}
              </div>

              {/* Grid */}
              {grid.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map((day, di) => {
                    const isActive = activeDays.has(day)
                    const isFuture = day > getDateKey(new Date())
                    return (
                      <div
                        key={di}
                        title={day}
                        className="w-3.5 h-3.5 rounded-sm shrink-0 transition-opacity"
                        style={{
                          backgroundColor: isFuture
                            ? "transparent"
                            : isActive
                            ? ACTIVE_COLOR
                            : INACTIVE_COLOR,
                          opacity: isFuture ? 0 : 1,
                        }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground ml-8">
              <span>Menos</span>
              {[0.15, 0.4, 0.65, 1].map((opacity, i) => (
                <div
                  key={i}
                  className="w-3.5 h-3.5 rounded-sm"
                  style={{ backgroundColor: ACTIVE_COLOR, opacity }}
                />
              ))}
              <span>Más</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
