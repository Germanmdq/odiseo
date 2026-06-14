"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Trash2, PenLine, Check, X, ChevronDown } from "lucide-react"
import { toast } from "sonner"

type Nota = { id: string; content: string; created_at: string; updated_at: string }

const ACTIVE_COLOR = "#E8401A"
const DAY_LABELS_SHORT = ["D", "L", "M", "X", "J", "V", "S"]

function utcDateKey(iso: string) {
  return iso.slice(0, 10)
}

function formatFechaLarga(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
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

function build30Days(): string[] {
  const days: string[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export default function DiarioPage() {
  const [notas, setNotas] = useState<Nota[]>([])
  const [loading, setLoading] = useState(true)
  const [nueva, setNueva] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
    el.style.height = Math.max(200, el.scrollHeight) + "px"
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
      if (textareaRef.current) {
        textareaRef.current.style.height = "200px"
      }
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

  function scrollToEntry(id: string) {
    setTimeout(() => {
      document.getElementById(`entry-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 50)
  }

  const days30 = build30Days()
  const todayKey = new Date().toISOString().slice(0, 10)

  // Map: dateKey → first nota ID (for scroll)
  const notasByDay = new Map<string, string>()
  for (const n of [...notas].reverse()) {
    const key = utcDateKey(n.created_at)
    notasByDay.set(key, n.id)
  }

  return (
    <div className="space-y-8 px-4 lg:px-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Diario</h1>
        <p className="text-muted-foreground text-sm">Tu práctica diaria, en palabras.</p>
      </div>

      {/* 30-day compact calendar */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Últimos 30 días</p>
        <div className="flex flex-wrap gap-1">
          {days30.map(day => {
            const hasEntry = notasByDay.has(day)
            const isToday = day === todayKey
            const dow = new Date(day + "T12:00:00").getDay()
            return (
              <button
                key={day}
                type="button"
                title={day}
                onClick={() => {
                  const id = notasByDay.get(day)
                  if (id) {
                    setExpandedId(id)
                    scrollToEntry(id)
                  }
                }}
                disabled={!hasEntry}
                className="flex flex-col items-center gap-0.5 group"
              >
                <div
                  className="w-6 h-6 rounded transition-opacity"
                  style={{
                    backgroundColor: hasEntry ? ACTIVE_COLOR : "hsl(var(--muted))",
                    opacity: hasEntry ? 1 : 0.5,
                    outline: isToday ? `2px solid ${ACTIVE_COLOR}` : undefined,
                    outlineOffset: isToday ? "2px" : undefined,
                  }}
                />
                <span className="text-[8px] text-muted-foreground leading-none">
                  {dow === 0 || dow === 6 ? DAY_LABELS_SHORT[dow] : ""}
                </span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--muted))", opacity: 0.5 }} />
          <span>Sin entrada</span>
          <div className="w-3 h-3 rounded ml-2" style={{ backgroundColor: ACTIVE_COLOR }} />
          <span>Con entrada</span>
        </div>
      </div>

      {/* Área de escritura */}
      <div className="space-y-1">
        <div className="relative">
          <textarea
            ref={textareaRef}
            placeholder="¿Qué querés registrar hoy?..."
            value={nueva}
            onChange={e => {
              setNueva(e.target.value)
              adjustHeight()
            }}
            onKeyDown={e => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                handleGuardar()
              }
            }}
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            style={{ minHeight: "200px" }}
          />
          {nueva.trim() && (
            <button
              type="button"
              onClick={handleGuardar}
              disabled={guardando}
              className="absolute top-2 right-2 rounded-md bg-primary text-primary-foreground p-1.5 hover:opacity-90 transition-opacity disabled:opacity-50"
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
      ) : notas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <PenLine className="h-8 w-8 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">Todavía no tenés entradas.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notas.map(nota => {
            const isExpanded = expandedId === nota.id
            const isEditing = editId === nota.id
            const isConfirmDelete = confirmDeleteId === nota.id
            return (
              <div
                key={nota.id}
                id={`entry-${nota.id}`}
                className="rounded-lg border bg-card transition-all"
              >
                {/* Collapsed / header */}
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
                    <p className="text-xs text-muted-foreground mb-1">{formatRelativa(nota.created_at)}</p>
                    <p className="text-sm text-foreground/80 line-clamp-2 whitespace-pre-wrap">
                      {nota.content}
                    </p>
                  </div>
                  <ChevronDown
                    className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 transition-transform"
                    style={{ transform: isExpanded ? "rotate(180deg)" : undefined }}
                  />
                </button>

                {/* Expanded */}
                {isExpanded && (
                  <div className="border-t px-4 pb-4 space-y-3">
                    <p className="text-xs text-muted-foreground pt-3">{formatFechaLarga(nota.created_at)}</p>

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
                          <button
                            type="button"
                            onClick={() => handleEditar(nota.id)}
                            className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditId(null); setEditContent("") }}
                            className="text-xs px-3 py-1.5 rounded-md border hover:bg-muted cursor-pointer text-muted-foreground"
                          >
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
                        <button
                          type="button"
                          onClick={() => { setEditId(nota.id); setEditContent(nota.content) }}
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                        >
                          <PenLine className="h-3 w-3" />
                          Editar
                        </button>
                        <span className="text-muted-foreground/30">·</span>
                        <button
                          type="button"
                          onClick={() => setExpandedId(null)}
                          className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          Cerrar
                        </button>
                        <span className="text-muted-foreground/30">·</span>
                        {isConfirmDelete ? (
                          <span className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">¿Eliminar?</span>
                            <button
                              type="button"
                              onClick={() => handleEliminar(nota.id)}
                              className="text-xs text-destructive hover:opacity-80 cursor-pointer"
                            >
                              Sí
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              No
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(nota.id)}
                            className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                            Borrar
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
  )
}
