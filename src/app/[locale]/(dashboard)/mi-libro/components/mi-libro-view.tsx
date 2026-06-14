"use client"

import * as React from "react"
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Sparkles,
  Trash2,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"

type Capitulo = {
  id: string
  titulo: string
  contenido: string
  orden: number
  memorias_origen: string[] | null
  created_at: string
  updated_at: string
}

type Memoria = {
  id: string
  item_type: string
  content: { text?: string } | string
  source: string
  created_at: string
}

const TYPE_LABELS: Record<string, string> = {
  coach: "Coach",
  narrador: "Creador de escenas",
  pregunta: "Preguntas",
  plan: "Tu plan",
  manual: "Manual",
}

function getContentText(content: Memoria["content"]): string {
  if (!content) return ""
  if (typeof content === "string") return content
  return content.text ?? ""
}

function CapituloCard({
  cap,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
  onMove,
}: {
  cap: Capitulo
  isFirst: boolean
  isLast: boolean
  onUpdate: (id: string, titulo: string, contenido: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onMove: (id: string, dir: "up" | "down") => Promise<void>
}) {
  const [titulo, setTitulo] = React.useState(cap.titulo)
  const [contenido, setContenido] = React.useState(cap.contenido)
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const dirty = titulo !== cap.titulo || contenido !== cap.contenido

  async function handleSave() {
    setSaving(true)
    await onUpdate(cap.id, titulo, contenido)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => void onMove(cap.id, "up")}
            disabled={isFirst}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronUp className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => void onMove(cap.id, "down")}
            disabled={isLast}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronDown className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-2 min-w-0">
          <Input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título del capítulo"
            className="font-semibold"
          />
          <Textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="Escribí el contenido del capítulo..."
            rows={8}
            className="resize-y text-sm leading-relaxed"
          />
        </div>

        <button
          type="button"
          onClick={() => void onDelete(cap.id)}
          className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Eliminar capítulo"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => void handleSave()}
          disabled={!dirty || saving}
          variant={saved ? "outline" : "default"}
        >
          {saving ? "Guardando..." : saved ? "Guardado ✓" : "Guardar"}
        </Button>
      </div>
    </div>
  )
}

export function MiLibroView() {
  const [capitulos, setCapitulos] = React.useState<Capitulo[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [generarOpen, setGenerarOpen] = React.useState(false)
  const [memorias, setMemorias] = React.useState<Memoria[]>([])
  const [memoriasLoading, setMemoriasLoading] = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [generating, setGenerating] = React.useState(false)
  const [draft, setDraft] = React.useState<{ titulo: string; contenido: string } | null>(null)
  const [draftTitulo, setDraftTitulo] = React.useState("")
  const [draftContenido, setDraftContenido] = React.useState("")
  const [savingDraft, setSavingDraft] = React.useState(false)

  React.useEffect(() => {
    fetch("/api/mi-libro")
      .then((r) => r.json())
      .then((d: { capitulos?: Capitulo[]; error?: string }) => {
        if (d.error) setError(d.error)
        else setCapitulos(d.capitulos ?? [])
      })
      .catch(() => setError("No se pudo cargar el libro."))
      .finally(() => setLoading(false))
  }, [])

  async function loadMemorias() {
    setMemoriasLoading(true)
    try {
      const r = await fetch("/api/memoria")
      const d = (await r.json()) as { memorias?: Memoria[] }
      setMemorias(
        (d.memorias ?? []).filter((m) =>
          ["coach", "narrador", "pregunta", "plan", "manual"].includes(m.item_type)
        )
      )
    } finally {
      setMemoriasLoading(false)
    }
  }

  function openGenerar() {
    setGenerarOpen(true)
    setDraft(null)
    setDraftTitulo("")
    setDraftContenido("")
    setSelectedIds(new Set())
    void loadMemorias()
  }

  async function handleGenerar() {
    if (!selectedIds.size) return
    setGenerating(true)
    setDraft({ titulo: "", contenido: "" })
    setDraftTitulo("")
    setDraftContenido("")

    try {
      const res = await fetch("/api/mi-libro/generar-capitulo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memoriaIds: [...selectedIds] }),
      })

      if (!res.ok || !res.body) throw new Error("Error al generar")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk

        // Parse title from first line if present
        const titleMatch = accumulated.match(/^\[Título sugerido:\s*(.+?)\]/m)
        if (titleMatch && !draftTitulo) {
          setDraftTitulo(titleMatch[1].trim())
        }

        const contentPart = accumulated.replace(/^\[Título sugerido:[^\]]+\]\s*/m, "").trim()
        setDraftContenido(contentPart)
      }

      setDraft({ titulo: draftTitulo, contenido: draftContenido })
    } catch {
      setDraftContenido("No se pudo generar el capítulo. Probá de nuevo.")
    } finally {
      setGenerating(false)
    }
  }

  async function handleSaveDraft() {
    setSavingDraft(true)
    try {
      const memoriaIds = [...selectedIds]
      const res = await fetch("/api/mi-libro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: draftTitulo || "Nuevo capítulo",
          contenido: draftContenido,
          memorias_origen: memoriaIds,
        }),
      })
      const d = (await res.json()) as { capitulo?: Capitulo }
      if (d.capitulo) {
        setCapitulos((prev) => [...prev, d.capitulo!])
        setGenerarOpen(false)
        setDraft(null)
      }
    } finally {
      setSavingDraft(false)
    }
  }

  async function handleNuevoEnBlanco() {
    const res = await fetch("/api/mi-libro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: "Nuevo capítulo", contenido: "" }),
    })
    const d = (await res.json()) as { capitulo?: Capitulo }
    if (d.capitulo) setCapitulos((prev) => [...prev, d.capitulo!])
  }

  async function handleUpdate(id: string, titulo: string, contenido: string) {
    const res = await fetch(`/api/mi-libro/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, contenido }),
    })
    const d = (await res.json()) as { capitulo?: Capitulo }
    if (d.capitulo) {
      setCapitulos((prev) => prev.map((c) => (c.id === id ? d.capitulo! : c)))
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/mi-libro/${id}`, { method: "DELETE" })
    setCapitulos((prev) => prev.filter((c) => c.id !== id))
  }

  async function handleMove(id: string, dir: "up" | "down") {
    const sorted = [...capitulos].sort((a, b) => a.orden - b.orden)
    const idx = sorted.findIndex((c) => c.id === id)
    if (idx < 0) return
    const swapIdx = dir === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return

    const a = sorted[idx]
    const b = sorted[swapIdx]
    const tempOrden = a.orden
    await Promise.all([
      fetch(`/api/mi-libro/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orden: b.orden }),
      }),
      fetch(`/api/mi-libro/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orden: tempOrden }),
      }),
    ])
    setCapitulos((prev) =>
      prev.map((c) => {
        if (c.id === a.id) return { ...c, orden: b.orden }
        if (c.id === b.id) return { ...c, orden: tempOrden }
        return c
      })
    )
  }

  const sorted = [...capitulos].sort((a, b) => a.orden - b.orden)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Cargando libro...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48 text-destructive text-sm">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button onClick={openGenerar} className="gap-2">
          <Sparkles className="size-4" />
          Generar desde Memoria
        </Button>
        <Button variant="outline" onClick={() => void handleNuevoEnBlanco()} className="gap-2">
          <PlusCircle className="size-4" />
          Nuevo capítulo en blanco
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <BookOpen className="size-10 text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm max-w-sm">
            Tu libro está vacío. Generá un capítulo desde tus memorias o empezá escribiendo directamente.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((cap, i) => (
            <CapituloCard
              key={cap.id}
              cap={cap}
              isFirst={i === 0}
              isLast={i === sorted.length - 1}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onMove={handleMove}
            />
          ))}
        </div>
      )}

      <Dialog open={generarOpen} onOpenChange={setGenerarOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-4" />
              Generar capítulo desde Memoria
            </DialogTitle>
          </DialogHeader>

          {!draft ? (
            <div className="flex flex-col gap-4 min-h-0">
              <p className="text-muted-foreground text-sm">
                Seleccioná las memorias que querés incluir en el capítulo.
              </p>

              {memoriasLoading ? (
                <p className="text-muted-foreground text-sm">Cargando memorias...</p>
              ) : memorias.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No hay memorias guardadas todavía. Guardá algo desde Coach, el Creador de escenas o Preguntas.
                </p>
              ) : (
                <ScrollArea className="flex-1 max-h-72">
                  <div className="space-y-2 pr-2">
                    {memorias.map((m) => {
                      const text = getContentText(m.content)
                      return (
                        <label
                          key={m.id}
                          className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50"
                        >
                          <Checkbox
                            checked={selectedIds.has(m.id)}
                            onCheckedChange={(checked) => {
                              setSelectedIds((prev) => {
                                const next = new Set(prev)
                                if (checked) next.add(m.id)
                                else next.delete(m.id)
                                return next
                              })
                            }}
                            className="mt-0.5"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-medium text-muted-foreground">
                              {TYPE_LABELS[m.item_type] ?? m.source}
                            </span>
                            <p className="text-sm line-clamp-2 mt-0.5">{text}</p>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setGenerarOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => void handleGenerar()}
                  disabled={!selectedIds.size || generating}
                  className="gap-2"
                >
                  <Sparkles className="size-4" />
                  {generating ? "Generando..." : `Generar borrador (${selectedIds.size})`}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 min-h-0 flex-1">
              <p className="text-muted-foreground text-xs">
                Borrador generado — editalo antes de guardar.
              </p>
              <Input
                value={draftTitulo}
                onChange={(e) => setDraftTitulo(e.target.value)}
                placeholder="Título del capítulo"
                className="font-semibold"
              />
              <Textarea
                value={draftContenido}
                onChange={(e) => setDraftContenido(e.target.value)}
                rows={12}
                className="flex-1 resize-none text-sm leading-relaxed"
                placeholder={generating ? "Generando..." : ""}
                readOnly={generating}
              />
              <div className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDraft(null)
                    setSelectedIds(new Set())
                  }}
                >
                  Volver a seleccionar
                </Button>
                <Button
                  onClick={() => void handleSaveDraft()}
                  disabled={savingDraft || generating || !draftContenido.trim()}
                >
                  {savingDraft ? "Guardando..." : "Agregar al libro"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
