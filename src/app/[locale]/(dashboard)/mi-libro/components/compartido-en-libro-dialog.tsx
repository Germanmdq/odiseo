"use client"

import * as React from "react"
import { BookOpen, Plus, Sparkles, Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useNombrePreferido } from "@/hooks/use-nombre-preferido"

interface Libro {
  id: string
  titulo: string
  descripcion: string
  cantidadCapitulos: number
  created_at: string
}

interface CompartidoEnLibroDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contenido: string
  libros: Libro[]
  locale: string
  onLibroCreado?: (libro: Libro) => void
  onGuardado: (libroId: string) => void
}

type Step = "seleccion" | "crear" | "generando" | "preview"

export function CompartidoEnLibroDialog({
  open,
  onOpenChange,
  contenido,
  libros,
  locale,
  onLibroCreado,
  onGuardado,
}: CompartidoEnLibroDialogProps) {
  const nombre = useNombrePreferido()

  const [step, setStep] = React.useState<Step>("seleccion")
  const [selectedLibroId, setSelectedLibroId] = React.useState<string | null>(null)
  const [nuevoTitulo, setNuevoTitulo] = React.useState("")
  const [creando, setCreando] = React.useState(false)
  const [draftTitulo, setDraftTitulo] = React.useState("")
  const [draftContenido, setDraftContenido] = React.useState("")
  const [generando, setGenerando] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Reset al abrir
  React.useEffect(() => {
    if (open) {
      setStep("seleccion")
      setSelectedLibroId(null)
      setNuevoTitulo("")
      setDraftTitulo("")
      setDraftContenido("")
      setError(null)
    }
  }, [open])

  async function generarDesdeFuente(libroId: string) {
    setSelectedLibroId(libroId)
    setStep("generando")
    setGenerando(true)
    setDraftTitulo("")
    setDraftContenido("")
    setError(null)
    try {
      const res = await fetch("/api/mi-libro/generar-capitulo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fuente: contenido, libroId }),
      })
      if (res.status === 403) {
        window.location.href = `/${locale}/pricing`
        return
      }
      if (res.status === 503) {
        setError("Estamos con mucha demanda en este momento. Probá de nuevo en un minuto.")
        return
      }
      if (!res.ok || !res.body) throw new Error("Error al generar")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        const titleMatch = accumulated.match(/^\[Título sugerido:\s*(.+?)\]/m)
        if (titleMatch) setDraftTitulo(titleMatch[1].trim())
        const contentPart = accumulated.replace(/^\[Título sugerido:[^\]]+\]\s*/m, "").trim()
        setDraftContenido(contentPart)
      }
      setStep("preview")
    } catch (e) {
      console.error(e)
      setError("No se pudo generar el capítulo. Probá de nuevo.")
    } finally {
      setGenerando(false)
    }
  }

  async function crearLibroYGenerar() {
    const titulo = nuevoTitulo.trim()
    if (!titulo || creando) return
    setCreando(true)
    setError(null)
    try {
      const res = await fetch("/api/mi-libro/libros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo }),
      })
      if (!res.ok) throw new Error("No se pudo crear el libro")
      const d = (await res.json()) as { libro: Libro }
      if (!d.libro) throw new Error("No se pudo crear el libro")
      onLibroCreado?.({ ...d.libro, cantidadCapitulos: 0 })
      await generarDesdeFuente(d.libro.id)
    } catch (e) {
      console.error(e)
      setError("No se pudo crear el libro. Probá de nuevo.")
    } finally {
      setCreando(false)
    }
  }

  async function guardarCapitulo() {
    if (!selectedLibroId || saving || !draftContenido.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/mi-libro/libros/${selectedLibroId}/capitulos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: draftTitulo.trim() || "Capítulo",
          contenido: draftContenido,
        }),
      })
      if (!res.ok) throw new Error("No se pudo guardar")
      onGuardado(selectedLibroId)
    } catch (e) {
      console.error(e)
      setError("No se pudo guardar el capítulo. Probá de nuevo.")
    } finally {
      setSaving(false)
    }
  }

  const tieneLibros = libros.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {/* Bloque cálido: "esto es lo que compartiste" — presente en todos los pasos */}
        <div className="rounded-xl border-l-4 border-[#E8401A] bg-[#E8401A]/[0.06] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="size-4 shrink-0 text-[#E8401A]" />
            <p className="text-sm font-semibold text-foreground">
              {nombre ? `${nombre}, esto es lo que compartiste:` : "Esto es lo que compartiste:"}
            </p>
          </div>
          <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
            {contenido}
          </p>
        </div>

        {step === "seleccion" && (
          <>
            <DialogHeader>
              <DialogTitle>
                {tieneLibros
                  ? "¿A cuál de tus libros querés agregar este contenido?"
                  : "Todavía no tenés ningún libro"}
              </DialogTitle>
              <DialogDescription>
                {tieneLibros
                  ? "Vamos a generar un capítulo a partir de tu contenido y lo agregamos al libro que elijas."
                  : "Creá tu primer libro para guardar este contenido como capítulo."}
              </DialogDescription>
            </DialogHeader>

            {tieneLibros ? (
              <div className="space-y-2">
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {libros.map((libro) => (
                    <button
                      key={libro.id}
                      type="button"
                      onClick={() => generarDesdeFuente(libro.id)}
                      className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted cursor-pointer"
                    >
                      <BookOpen className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{libro.titulo}</span>
                        <span className="block text-xs text-muted-foreground">
                          {libro.cantidadCapitulos} capítulos
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setStep("crear")}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed p-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted cursor-pointer"
                >
                  <Plus className="size-4" />
                  Crear un libro nuevo
                </button>
              </div>
            ) : (
              <Button
                type="button"
                onClick={() => setStep("crear")}
                className="w-full"
                style={{ backgroundColor: "#E8401A", color: "#fff" }}
              >
                <Plus className="size-4" />
                Crear mi primer libro
              </Button>
            )}
          </>
        )}

        {step === "crear" && (
          <>
            <DialogHeader>
              <DialogTitle>Crear un libro</DialogTitle>
              <DialogDescription>Ponele un título a tu libro nuevo.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void crearLibroYGenerar()
              }}
              className="space-y-3"
            >
              <Input
                value={nuevoTitulo}
                onChange={(e) => setNuevoTitulo(e.target.value)}
                placeholder="Título del libro"
                disabled={creando}
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("seleccion")}
                  disabled={creando}
                >
                  Volver
                </Button>
                <Button
                  type="submit"
                  disabled={!nuevoTitulo.trim() || creando}
                  style={{ backgroundColor: "#E8401A", color: "#fff" }}
                >
                  {creando ? "Creando..." : "Crear y generar"}
                </Button>
              </div>
            </form>
          </>
        )}

        {step === "generando" && (
          <>
            <DialogHeader>
              <DialogTitle>Generando tu capítulo</DialogTitle>
              <DialogDescription>
                Estamos escribiendo un capítulo a partir de tu contenido. Vas a poder editarlo antes de guardar.
              </DialogDescription>
            </DialogHeader>
            {error ? (
              <div className="space-y-3">
                <p className="text-sm text-destructive">{error}</p>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep("seleccion")}>
                    Volver
                  </Button>
                  <Button
                    type="button"
                    onClick={() => selectedLibroId && generarDesdeFuente(selectedLibroId)}
                    style={{ backgroundColor: "#E8401A", color: "#fff" }}
                  >
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-[#E8401A]" />
                  Generando capítulo…
                </p>
                {draftContenido && (
                  <p className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border bg-muted/20 p-3 text-sm leading-relaxed text-foreground/70">
                    {draftContenido}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {step === "preview" && (
          <>
            <DialogHeader>
              <DialogTitle>Revisá tu capítulo</DialogTitle>
              <DialogDescription>
                Editá el título y el texto si querés. Se guarda solo cuando lo confirmás.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                value={draftTitulo}
                onChange={(e) => setDraftTitulo(e.target.value)}
                placeholder="Título del capítulo"
                className="font-semibold"
              />
              <Textarea
                value={draftContenido}
                onChange={(e) => setDraftContenido(e.target.value)}
                rows={10}
                className="resize-none text-sm leading-relaxed"
                placeholder="Contenido del capítulo"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={guardarCapitulo}
                  disabled={saving || generando || !draftContenido.trim()}
                  style={{ backgroundColor: "#E8401A", color: "#fff" }}
                >
                  {saving ? "Guardando..." : "Guardar capítulo"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
