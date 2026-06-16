"use client"

import type { ComponentProps } from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { es } from "date-fns/locale"
import { Trash2, PenLine, Check, ChevronDown } from "lucide-react"
import { toast } from "sonner"

import { Calendar, CalendarDayButton } from "@/components/ui/calendar"

type Nota = { id: string; content: string; created_at: string; updated_at: string }

const ACTIVE_COLOR = "#E8401A"

function notaDateKey(iso: string) {
  return iso.slice(0, 10)
}

function selectedDateKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

function relativa(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Ahora mismo"
  if (mins < 60) return `Hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs} h`
  const d = Math.floor(hrs / 24)
  if (d === 1) return "Ayer"
  if (d < 7) return `Hace ${d} días`
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short" })
}

function EntryDayButton(props: ComponentProps<typeof CalendarDayButton>) {
  const { children, modifiers, ...rest } = props
  const hasEntry = !!(modifiers as Record<string, boolean>).hasEntry
  return (
    <CalendarDayButton modifiers={modifiers} {...rest}>
      {children}
      {hasEntry && (
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

export default function DiarioPage() {
  const [notas, setNotas] = useState<Nota[]>([])
  const [loading, setLoading] = useState(true)
  const [nueva, setNueva] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem("odiseo_reutilizar")
    if (raw) {
      try {
        const { content } = JSON.parse(raw) as { content: string }
        sessionStorage.removeItem("odiseo_reutilizar")
        setNueva(content)
        textareaRef.current?.focus()
      } catch {}
    }
  }, [])

  useEffect(() => {
    fetch("/api/notas")
      .then(r => r.json())
      .then(d => setNotas(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Error al cargar el diario"))
      .finally(() => setLoading(false))
  }, [])

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.max(120, el.scrollHeight) + "px"
  }, [])

  async function handleGuardar() {
    if (!nueva.trim() || guardando) return
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
      if (textareaRef.current) textareaRef.current.style.height = "120px"
      setSelectedDay(undefined)
    } catch {
      toast.error("Error al guardar")
    } finally {
      setGuardando(false)
    }
  }

  async function handleEditar(id: string) {
    if (!editContent.trim()) return
    try {
      const r = await fetch(`/api/notas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      })
      const actualizada = await r.json() as Nota
      setNotas(prev => prev.map(n => n.id === id ? actualizada : n))
      setEditId(null)
      setEditContent("")
    } catch {
      toast.error("Error al guardar")
    }
  }

  async function handleEliminar(id: string) {
    try {
      await fetch(`/api/notas/${id}`, { method: "DELETE" })
      setNotas(prev => prev.filter(n => n.id !== id))
      setConfirmDeleteId(null)
      if (expandedId === id) setExpandedId(null)
    } catch {
      toast.error("Error al eliminar")
    }
  }

  const datesWithEntries = notas.map(n => new Date(notaDateKey(n.created_at) + "T12:00:00"))

  const selectedKey = selectedDay ? selectedDateKey(selectedDay) : null
  const visibleNotas = selectedKey
    ? notas.filter(n => notaDateKey(n.created_at) === selectedKey)
    : notas

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Diario</h1>
        <p className="text-muted-foreground text-sm">Tu práctica diaria, en palabras.</p>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-[auto_1fr] gap-8 items-start">
        {/* Columna izquierda: Calendar */}
        <div className="sticky top-6 shrink-0">
          <div className="rounded-lg border p-2">
            <Calendar
              mode="single"
              selected={selectedDay}
              onSelect={d =>
                setSelectedDay(d?.toDateString() === selectedDay?.toDateString() ? undefined : d)
              }
              locale={es}
              modifiers={{ hasEntry: datesWithEntries }}
              components={{ DayButton: EntryDayButton }}
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
                  Ver todas
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha: textarea + lista */}
        <div className="min-w-0 space-y-4">
          {/* Nueva entrada */}
          <div className="space-y-1">
            <div className="relative">
              <textarea
                ref={textareaRef}
                placeholder="¿Qué querés registrar hoy?..."
                value={nueva}
                onChange={e => { setNueva(e.target.value); adjustHeight() }}
                onKeyDown={e => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    handleGuardar()
                  }
                }}
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ minHeight: "120px" }}
              />
              {nueva.trim() && (
                <button
                  type="button"
                  onClick={handleGuardar}
                  disabled={guardando}
                  className="absolute top-2 right-2 rounded-md bg-primary text-primary-foreground p-1.5 hover:opacity-90 disabled:opacity-50"
                  title="Guardar (⌘+Enter)"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground text-right">⌘+Enter para guardar</p>
          </div>

          {/* Lista de entradas */}
          {loading ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Cargando...</p>
          ) : visibleNotas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <PenLine className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">
                {selectedDay ? "No hay entradas para este día." : "Todavía no tenés entradas."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {visibleNotas.map(nota => {
                const isExpanded = expandedId === nota.id
                const isEditing = editId === nota.id
                const isConfirmDelete = confirmDeleteId === nota.id
                return (
                  <div key={nota.id} className="rounded-lg border bg-card">
                    <button
                      type="button"
                      className="w-full flex items-start gap-3 p-4 text-left"
                      onClick={() => {
                        setExpandedId(isExpanded ? null : nota.id)
                        setEditId(null)
                        setConfirmDeleteId(null)
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">{relativa(nota.created_at)}</p>
                        <p className="text-sm text-foreground/80 line-clamp-2 whitespace-pre-wrap">
                          {nota.content}
                        </p>
                      </div>
                      <ChevronDown
                        className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 transition-transform"
                        style={{ transform: isExpanded ? "rotate(180deg)" : undefined }}
                      />
                    </button>

                    {isExpanded && (
                      <div className="border-t px-4 pb-4 space-y-3">
                        <p className="text-xs text-muted-foreground pt-3">
                          {new Date(nota.created_at).toLocaleDateString("es-AR", {
                            weekday: "long", day: "numeric", month: "long", year: "numeric",
                          })}
                        </p>
                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              value={editContent}
                              onChange={e => setEditContent(e.target.value)}
                              rows={6}
                              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button type="button" onClick={() => handleEditar(nota.id)}
                                className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 cursor-pointer">
                                Guardar
                              </button>
                              <button type="button" onClick={() => { setEditId(null); setEditContent("") }}
                                className="text-xs px-3 py-1.5 rounded-md border hover:bg-muted cursor-pointer text-muted-foreground">
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                            {nota.content}
                          </p>
                        )}
                        {!isEditing && (
                          <div className="flex items-center gap-2 pt-1">
                            <button type="button" onClick={() => { setEditId(nota.id); setEditContent(nota.content) }}
                              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer">
                              <PenLine className="h-3 w-3" /> Editar
                            </button>
                            <span className="text-muted-foreground/30">·</span>
                            <button type="button" onClick={() => setExpandedId(null)}
                              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                              Cerrar
                            </button>
                            <span className="text-muted-foreground/30">·</span>
                            {isConfirmDelete ? (
                              <span className="flex items-center gap-1.5">
                                <span className="text-xs text-muted-foreground">¿Eliminar?</span>
                                <button type="button" onClick={() => handleEliminar(nota.id)}
                                  className="text-xs text-destructive hover:opacity-80 cursor-pointer">Sí</button>
                                <button type="button" onClick={() => setConfirmDeleteId(null)}
                                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">No</button>
                              </span>
                            ) : (
                              <button type="button" onClick={() => setConfirmDeleteId(nota.id)}
                                className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 cursor-pointer">
                                <Trash2 className="h-3 w-3" /> Borrar
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
