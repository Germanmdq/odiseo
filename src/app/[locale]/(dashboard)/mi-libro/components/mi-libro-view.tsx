"use client"

import * as React from "react"
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Pencil,
  PlusCircle,
  Sparkles,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CompartirEn } from "@/components/compartir-en"

type Capitulo = {
  id: string
  titulo: string
  contenido: string
  orden: number
  memorias_origen: string[] | null
  created_at: string
  updated_at: string
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
  const [confirmDelete, setConfirmDelete] = React.useState(false)
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

        {confirmDelete ? (
          <div className="flex flex-col gap-1 items-end shrink-0">
            <p className="text-xs text-muted-foreground">¿Eliminar?</p>
            <button
              type="button"
              onClick={() => void onDelete(cap.id)}
              className="text-xs text-destructive hover:opacity-80"
            >
              Sí
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              No
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Eliminar capítulo"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <CompartirEn contenido={contenido} titulo={titulo} origen="mi-libro" size="xs" label="Usar este capítulo" />
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

const LIBRO_TITULO_KEY = "odiseo_libro_titulo"

export function MiLibroView() {
  const [capitulos, setCapitulos] = React.useState<Capitulo[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [libroTitulo, setLibroTitulo] = React.useState("")
  const [editandoTitulo, setEditandoTitulo] = React.useState(false)
  const [showNuevoLibro, setShowNuevoLibro] = React.useState(false)
  const [nuevoLibroTitulo, setNuevoLibroTitulo] = React.useState("")

  // IA generation state
  const [temaInput, setTemaInput] = React.useState("")
  const [generating, setGenerating] = React.useState(false)
  const [draftTitulo, setDraftTitulo] = React.useState("")
  const [draftContenido, setDraftContenido] = React.useState("")
  const [showDraft, setShowDraft] = React.useState(false)
  const [savingDraft, setSavingDraft] = React.useState(false)

  React.useEffect(() => {
    const saved = localStorage.getItem(LIBRO_TITULO_KEY)
    if (saved) setLibroTitulo(saved)
  }, [])

  function handleGuardarTitulo() {
    localStorage.setItem(LIBRO_TITULO_KEY, libroTitulo)
    setEditandoTitulo(false)
  }

  function handleNuevoLibro() {
    if (!nuevoLibroTitulo.trim()) return
    localStorage.setItem(LIBRO_TITULO_KEY, nuevoLibroTitulo.trim())
    setLibroTitulo(nuevoLibroTitulo.trim())
    setNuevoLibroTitulo("")
    setShowNuevoLibro(false)
  }

  React.useEffect(() => {
    const raw = sessionStorage.getItem("odiseo_reutilizar")
    if (raw) {
      try {
        const { content } = JSON.parse(raw) as { content: string }
        sessionStorage.removeItem("odiseo_reutilizar")
        setTemaInput(content.slice(0, 200))
      } catch {}
    }
  }, [])

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

  async function handleGenerar() {
    const tema = temaInput.trim()
    if (!tema || generating) return
    setGenerating(true)
    setShowDraft(true)
    setDraftTitulo("")
    setDraftContenido("")

    try {
      const res = await fetch("/api/mi-libro/generar-capitulo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema }),
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

        const titleMatch = accumulated.match(/^\[Título sugerido:\s*(.+?)\]/m)
        if (titleMatch) {
          setDraftTitulo(titleMatch[1].trim())
        }

        const contentPart = accumulated.replace(/^\[Título sugerido:[^\]]+\]\s*/m, "").trim()
        setDraftContenido(contentPart)
      }
    } catch {
      setDraftContenido("No se pudo generar el capítulo. Probá de nuevo.")
    } finally {
      setGenerating(false)
    }
  }

  async function handleSaveDraft() {
    setSavingDraft(true)
    try {
      const res = await fetch("/api/mi-libro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: draftTitulo || `Capítulo sobre ${temaInput}`,
          contenido: draftContenido,
          memorias_origen: [],
        }),
      })
      const d = (await res.json()) as { capitulo?: Capitulo }
      if (d.capitulo) {
        setCapitulos((prev) => [...prev, d.capitulo!])
        setShowDraft(false)
        setTemaInput("")
        setDraftTitulo("")
        setDraftContenido("")
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
    <div className="space-y-6">
      {/* Título del libro */}
      <div className="rounded-xl border bg-card px-5 py-4 space-y-2">
        {editandoTitulo ? (
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={libroTitulo}
              onChange={(e) => setLibroTitulo(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleGuardarTitulo() }}
              placeholder="Título de tu libro"
              autoFocus
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-lg font-bold placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button size="sm" onClick={handleGuardarTitulo}>Guardar</Button>
            <button type="button" onClick={() => setEditandoTitulo(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancelar</button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold truncate">
              {libroTitulo || <span className="text-muted-foreground font-normal text-base">Sin título — hacé clic para nombrar tu libro</span>}
            </h2>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setEditandoTitulo(true)}
                className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Editar título"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowNuevoLibro(true)}
                className="rounded px-2.5 py-1 text-xs text-muted-foreground border hover:text-foreground hover:bg-muted transition-colors"
              >
                Nuevo libro
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nuevo libro */}
      {showNuevoLibro && (
        <div className="rounded-xl border bg-card px-5 py-4 space-y-3">
          <p className="text-sm font-medium">¿Cómo se llama el nuevo libro?</p>
          <p className="text-xs text-muted-foreground">Los capítulos actuales quedan guardados. El nuevo libro empieza desde acá con un título nuevo.</p>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={nuevoLibroTitulo}
              onChange={(e) => setNuevoLibroTitulo(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleNuevoLibro() }}
              placeholder="Título del nuevo libro"
              autoFocus
              className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button size="sm" onClick={handleNuevoLibro} disabled={!nuevoLibroTitulo.trim()}>Crear</Button>
            <button type="button" onClick={() => { setShowNuevoLibro(false); setNuevoLibroTitulo("") }} className="text-xs text-muted-foreground hover:text-foreground">Cancelar</button>
          </div>
        </div>
      )}

      {/* Crear nuevo capítulo */}
      {!showDraft ? (
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="space-y-1">
            <p className="font-semibold">Crear capítulo con el Asistente</p>
            <p className="text-sm text-muted-foreground">
              Escribí un tema y la IA genera un capítulo basado en las enseñanzas de Neville.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={temaInput}
              onChange={(e) => setTemaInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleGenerar() }}
              placeholder="¿Sobre qué querés escribir un capítulo?"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button
              onClick={() => void handleGenerar()}
              disabled={!temaInput.trim() || generating}
              className="gap-2 sm:shrink-0 w-full sm:w-auto"
            >
              <Sparkles className="size-4" />
              Generar con el Asistente
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 border-t" />
            <span className="text-xs text-muted-foreground">o</span>
            <div className="flex-1 border-t" />
          </div>
          <Button variant="outline" onClick={() => void handleNuevoEnBlanco()} className="gap-2 w-full">
            <PlusCircle className="size-4" />
            Capítulo en blanco
          </Button>
        </div>
      ) : (
        /* Draft editor */
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm text-muted-foreground">
              {generating ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="size-4 animate-pulse" style={{ color: "#E8401A" }} />
                  Generando capítulo sobre "{temaInput}"…
                </span>
              ) : (
                "Borrador generado — editalo antes de guardar"
              )}
            </p>
            {!generating && (
              <button
                type="button"
                onClick={() => { setShowDraft(false); setDraftTitulo(""); setDraftContenido("") }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cancelar
              </button>
            )}
          </div>
          <input
            type="text"
            value={draftTitulo}
            onChange={(e) => setDraftTitulo(e.target.value)}
            placeholder="Título del capítulo"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Textarea
            value={draftContenido}
            onChange={(e) => setDraftContenido(e.target.value)}
            rows={14}
            className="resize-none text-sm leading-relaxed"
            placeholder={generating ? "Generando..." : "El capítulo generado aparecerá acá..."}
            readOnly={generating}
          />
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => void handleSaveDraft()}
              disabled={savingDraft || generating || !draftContenido.trim()}
            >
              {savingDraft ? "Guardando..." : "Agregar al libro"}
            </Button>
          </div>
        </div>
      )}

      {/* Lista de capítulos */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <BookOpen className="size-10 text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm max-w-sm">
            Tu libro está vacío. Generá un capítulo con IA o empezá escribiendo directamente.
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
    </div>
  )
}
