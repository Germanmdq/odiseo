"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, PenLine } from "lucide-react"
import { toast } from "sonner"

type Nota = { id: string; content: string; created_at: string; updated_at: string }

function dateKey(iso: string) {
  return iso.slice(0, 10)
}

function formatFechaLarga(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatFechaCorta(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short" })
}

function build15Days() {
  const days: string[] = []
  const today = new Date()
  for (let i = 14; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

const DAY_LABELS = ["D", "L", "M", "X", "J", "V", "S"]
const ACTIVE_COLOR = "#E8401A"

export default function DiarioPage() {
  const [notas, setNotas] = useState<Nota[]>([])
  const [loading, setLoading] = useState(true)
  const [nueva, setNueva] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/notas")
      .then(r => r.json())
      .then(d => setNotas(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Error al cargar el diario"))
      .finally(() => setLoading(false))
  }, [])

  async function handleGuardar() {
    if (!nueva.trim()) return
    setGuardando(true)
    try {
      const r = await fetch("/api/notas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: nueva }),
      })
      const nota = await r.json() as Nota
      setNotas(prev => [nota, ...prev])
      setNueva("")
    } catch {
      toast.error("Error al guardar")
    } finally {
      setGuardando(false)
    }
  }

  async function handleEliminar(id: string) {
    try {
      await fetch(`/api/notas/${id}`, { method: "DELETE" })
      setNotas(prev => prev.filter(n => n.id !== id))
      setConfirmId(null)
    } catch {
      toast.error("Error al eliminar")
    }
  }

  const days15 = build15Days()
  const activeDays = new Set(notas.map(n => dateKey(n.created_at)))

  const todayKey = new Date().toISOString().slice(0, 10)

  return (
    <div className="space-y-8 px-4 lg:px-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Diario</h1>
        <p className="text-muted-foreground">Tu práctica diaria, en palabras.</p>
      </div>

      {/* 15-day grid */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Últimos 15 días</h2>
        <div className="flex gap-1.5 flex-wrap">
          {days15.map(day => {
            const isToday = day === todayKey
            const hasEntry = activeDays.has(day)
            const dayOfWeek = new Date(day + "T12:00:00").getDay()
            return (
              <div key={day} className="flex flex-col items-center gap-0.5">
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-medium transition-colors"
                  style={{
                    backgroundColor: hasEntry ? ACTIVE_COLOR : undefined,
                    color: hasEntry ? "#fff" : undefined,
                    outline: isToday ? `2px solid ${ACTIVE_COLOR}` : undefined,
                    outlineOffset: isToday ? "2px" : undefined,
                  }}
                  title={day}
                >
                  {!hasEntry && (
                    <span className="text-muted-foreground/50 text-[10px]">
                      {new Date(day + "T12:00:00").getDate()}
                    </span>
                  )}
                  {hasEntry && (
                    <span className="text-[11px]">
                      {new Date(day + "T12:00:00").getDate()}
                    </span>
                  )}
                </div>
                <span className="text-[9px] text-muted-foreground">{DAY_LABELS[dayOfWeek]}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Nueva entrada */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nueva entrada</h2>
        <Textarea
          placeholder="¿Qué querés registrar hoy?..."
          value={nueva}
          onChange={e => setNueva(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGuardar() }}
          rows={5}
          className="resize-none text-sm leading-relaxed"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleGuardar}
            disabled={guardando || !nueva.trim()}
            className="cursor-pointer gap-2"
          >
            <PenLine className="h-4 w-4" />
            Guardar entrada
          </Button>
        </div>
      </div>

      {/* Entradas anteriores */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Entradas</h2>
        {loading ? (
          <p className="text-muted-foreground text-sm py-8 text-center">Cargando...</p>
        ) : notas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PenLine className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">Todavía no tenés entradas. Escribí la primera arriba.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notas.map(nota => (
              <Card key={nota.id} className="group">
                <CardContent className="p-4">
                  {confirmId === nota.id ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">¿Eliminar esta entrada?</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleEliminar(nota.id)}
                          className="cursor-pointer"
                        >
                          Eliminar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmId(null)}
                          className="cursor-pointer"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-medium text-muted-foreground">
                          {formatFechaLarga(nota.created_at)}
                        </p>
                        <button
                          type="button"
                          onClick={() => setConfirmId(nota.id)}
                          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-sm leading-relaxed line-clamp-3 whitespace-pre-wrap">
                        {nota.content}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
