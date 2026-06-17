"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import {
  BookOpen,
  Plus,
  ArrowLeft,
  Download,
  Sparkles,
  Loader2,
  ScrollText,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { CrearLibroDialog } from "./crear-libro-dialog"
import { CapituloItem } from "./capitulo-item"

interface Libro {
  id: string
  titulo: string
  descripcion: string
  cantidadCapitulos: number
  created_at: string
}

interface Capitulo {
  id: string
  titulo: string
  contenido: string
  orden: number
  created_at: string
}

interface MisLibrosViewProps {
  activeLibroId?: string | null
}

export function MisLibrosView({ activeLibroId }: MisLibrosViewProps) {
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as string) ?? "es"

  const [libros, setLibros] = React.useState<Libro[]>([])
  const [capitulos, setCapitulos] = React.useState<Capitulo[]>([])
  const [loadingLibros, setLoadingLibros] = React.useState(true)
  const [loadingCapitulos, setLoadingCapitulos] = React.useState(false)
  const [creandoLibro, setCreandoLibro] = React.useState(false)

  // IA Generation State
  const [tema, setTema] = React.useState("")
  const [generando, setGenerando] = React.useState(false)
  const [draftTitulo, setDraftTitulo] = React.useState("")
  const [draftContenido, setDraftContenido] = React.useState("")
  const [showDraft, setShowDraft] = React.useState(false)
  const [savingDraft, setSavingDraft] = React.useState(false)

  // Load books on mount
  React.useEffect(() => {
    async function loadLibros() {
      try {
        const res = await fetch("/api/mi-libro/libros")
        if (!res.ok) throw new Error()
        const d = (await res.json()) as { libros: Libro[] }
        setLibros(d.libros ?? [])
      } catch (err) {
        console.error("Error cargando libros:", err)
      } finally {
        setLoadingLibros(false)
      }
    }
    loadLibros()
  }, [])

  // Pre-fill theme input if sessionStorage redirect exists
  React.useEffect(() => {
    const raw = sessionStorage.getItem("odiseo_reutilizar")
    if (raw) {
      try {
        const { content } = JSON.parse(raw) as { content: string }
        sessionStorage.removeItem("odiseo_reutilizar")
        setTema(content.slice(0, 200))
      } catch {}
    }
  }, [])

  // Load chapters when active book changes
  React.useEffect(() => {
    if (!activeLibroId) {
      setCapitulos([])
      return
    }
    async function loadCapitulos() {
      setLoadingCapitulos(true)
      try {
        const res = await fetch(`/api/mi-libro/libros/${activeLibroId}/capitulos`)
        if (!res.ok) throw new Error()
        const d = (await res.json()) as { capitulos: Capitulo[] }
        setCapitulos(d.capitulos ?? [])
      } catch (err) {
        console.error("Error cargando capítulos:", err)
      } finally {
        setLoadingCapitulos(false)
      }
    }
    loadCapitulos()
    setShowDraft(false)
    setDraftTitulo("")
    setDraftContenido("")
  }, [activeLibroId])

  const libroActivo = libros.find((l) => l.id === activeLibroId)

  // Create Book
  const handleCrearLibro = async (titulo: string) => {
    const res = await fetch("/api/mi-libro/libros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo }),
    })
    if (!res.ok) throw new Error("No se pudo crear el libro")
    const d = (await res.json()) as { libro: Libro }
    if (d.libro) {
      const nuevo = { ...d.libro, cantidadCapitulos: 0 }
      setLibros((prev) => [nuevo, ...prev])
      router.push(`/${locale}/mi-libro/${d.libro.id}`)
    }
  }

  // Generate Chapter Stream
  const handleGenerarCapitulo = async () => {
    const temaTrim = tema.trim()
    if (!temaTrim || generando || !activeLibroId) return
    setGenerando(true)
    setShowDraft(true)
    setDraftTitulo("")
    setDraftContenido("")

    try {
      const res = await fetch("/api/mi-libro/generar-capitulo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema: temaTrim, libroId: activeLibroId }),
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
    } catch (err) {
      console.error(err)
      setDraftContenido("No se pudo generar el capítulo. Probá de nuevo.")
    } finally {
      setGenerando(false)
    }
  }

  // Save AI Draft
  const handleSaveDraft = async () => {
    if (!activeLibroId || savingDraft) return
    setSavingDraft(true)
    try {
      const res = await fetch(`/api/mi-libro/libros/${activeLibroId}/capitulos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: draftTitulo || `Capítulo sobre ${tema}`,
          contenido: draftContenido,
        }),
      })
      const d = (await res.json()) as { capitulo?: Capitulo }
      if (d.capitulo) {
        setCapitulos((prev) => [...prev, d.capitulo!])
        setLibros((prev) =>
          prev.map((l) =>
            l.id === activeLibroId
              ? { ...l, cantidadCapitulos: l.cantidadCapitulos + 1 }
              : l
          )
        )
        setShowDraft(false)
        setTema("")
        setDraftTitulo("")
        setDraftContenido("")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSavingDraft(false)
    }
  }

  // Save Edit Chapter
  const handleSaveChapter = async (capId: string, nuevoTexto: string) => {
    try {
      const res = await fetch(`/api/mi-libro/capitulos/${capId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenido: nuevoTexto }),
      })
      const d = (await res.json()) as { capitulo?: Capitulo }
      if (d.capitulo) {
        setCapitulos((prev) =>
          prev.map((c) => (c.id === capId ? { ...c, contenido: d.capitulo!.contenido } : c))
        )
      }
    } catch (err) {
      console.error("Error guardando capítulo:", err)
    }
  }

  // Delete Chapter
  const handleDeleteChapter = async (capId: string) => {
    if (!window.confirm("¿Seguro que querés eliminar este capítulo?")) return
    try {
      const res = await fetch(`/api/mi-libro/capitulos/${capId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setCapitulos((prev) => prev.filter((c) => c.id !== capId))
        setLibros((prev) =>
          prev.map((l) =>
            l.id === activeLibroId
              ? { ...l, cantidadCapitulos: Math.max(0, l.cantidadCapitulos - 1) }
              : l
          )
        )
      }
    } catch (err) {
      console.error("Error eliminando capítulo:", err)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] h-[calc(100vh-160px)] min-h-[500px] border rounded-xl overflow-hidden bg-card text-card-foreground">
      {/* Columna Izquierda: Listado de Libros */}
      <div
        className={cn(
          "flex flex-col h-full border-r bg-muted/10",
          activeLibroId ? "hidden md:flex" : "flex"
        )}
      >
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Mis libros</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Tu biblioteca personal</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loadingLibros ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Cargando biblioteca...
            </div>
          ) : libros.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No hay libros creados aún.
            </div>
          ) : (
            libros.map((libro) => (
              <button
                key={libro.id}
                type="button"
                onClick={() => router.push(`/${locale}/mi-libro/${libro.id}`)}
                className={cn(
                  "w-full text-left rounded-lg p-3 transition-colors cursor-pointer",
                  activeLibroId === libro.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 shrink-0" />
                  <span className="font-medium text-sm truncate">{libro.titulo}</span>
                </div>
                <p
                  className={cn(
                    "text-xs mt-1 ml-6",
                    activeLibroId === libro.id ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}
                >
                  {libro.cantidadCapitulos} capítulos
                </p>
              </button>
            ))
          )}
        </div>

        <div className="p-3 border-t bg-card">
          <button
            type="button"
            onClick={() => setCreandoLibro(true)}
            className="w-full flex items-center justify-center gap-2 rounded-lg p-3 text-sm text-white font-medium transition-colors hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: "#E8401A" }}
          >
            <Plus className="size-4" />
            Nuevo libro
          </button>
        </div>
      </div>

      {/* Columna Derecha: Contenido del Libro Activo */}
      <div
        className={cn(
          "flex flex-col h-full overflow-hidden bg-background",
          activeLibroId ? "flex" : "hidden md:flex"
        )}
      >
        {loadingCapitulos && capitulos.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            Cargando contenido del libro...
          </div>
        ) : !libroActivo ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-muted/5">
            <BookOpen className="size-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm font-medium">
              No hay ningún libro seleccionado
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Elegí un libro de la lista lateral o creá uno nuevo.
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header del libro */}
            <div className="flex items-center gap-4 p-4 md:p-6 border-b shrink-0 bg-card">
              <button
                type="button"
                onClick={() => router.push(`/${locale}/mi-libro`)}
                className="md:hidden p-1.5 hover:bg-muted rounded-lg text-muted-foreground cursor-pointer"
              >
                <ArrowLeft className="size-5" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-xl font-semibold truncate">
                  {libroActivo.titulo}
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                  {capitulos.length} capítulos
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled type="button">
                  <Download className="size-4 mr-1.5" />
                  PDF (próximo)
                </Button>
              </div>
            </div>

            {/* Formulario e Editor de Borrador (Condicional) */}
            {showDraft ? (
              <div className="p-4 md:p-6 border-b bg-muted/20 space-y-4 shrink-0 overflow-y-auto max-h-[300px]">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-xs md:text-sm text-muted-foreground flex items-center gap-2">
                    {generando ? (
                      <>
                        <Loader2 className="size-4 animate-spin text-[#E8401A]" />
                        Generando capítulo sobre "{tema}"…
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4 text-[#E8401A]" />
                        Borrador generado — editalo antes de guardar
                      </>
                    )}
                  </p>
                  {!generando && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowDraft(false)
                        setDraftTitulo("")
                        setDraftContenido("")
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
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
                  disabled={generando}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <Textarea
                  value={draftContenido}
                  onChange={(e) => setDraftContenido(e.target.value)}
                  rows={6}
                  className="resize-none text-sm leading-relaxed"
                  placeholder={
                    generando ? "Generando contenido..." : "Escribí o editá tu borrador..."
                  }
                  readOnly={generando}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={savingDraft || generando || !draftContenido.trim()}
                    style={{ backgroundColor: "#E8401A", color: "#fff" }}
                  >
                    {savingDraft ? "Guardando..." : "Agregar al libro"}
                  </Button>
                </div>
              </div>
            ) : (
              /* Agregar capítulo con IA */
              <div className="p-4 md:p-6 border-b bg-muted/20 shrink-0">
                <p className="text-xs md:text-sm font-medium mb-3">
                  Agregar capítulo con Asistente IA
                </p>
                <div className="flex gap-2">
                  <input
                    value={tema}
                    onChange={(e) => setTema(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleGenerarCapitulo()
                    }}
                    placeholder="¿Sobre qué tema querés escribir?"
                    className="flex-1 rounded-lg border px-3 py-2 text-sm bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-w-0"
                  />
                  <Button
                    type="button"
                    onClick={handleGenerarCapitulo}
                    disabled={generando || !tema.trim()}
                    style={{ backgroundColor: "#E8401A", color: "#fff" }}
                  >
                    {generando ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    <span className="ml-1.5 hidden sm:inline">Generar</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de capítulos colapsables */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 bg-muted/5">
              {capitulos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ScrollText className="size-10 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground text-sm">
                    Este libro no tiene capítulos todavía.
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Usá el formulario de arriba para generar el primero.
                  </p>
                </div>
              ) : (
                capitulos.map((cap, index) => (
                  <CapituloItem
                    key={cap.id}
                    capitulo={cap}
                    numero={index + 1}
                    onDelete={() => handleDeleteChapter(cap.id)}
                    onSave={(texto) => handleSaveChapter(cap.id, texto)}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <CrearLibroDialog
        open={creandoLibro}
        onOpenChange={setCreandoLibro}
        onCreate={handleCrearLibro}
      />
    </div>
  )
}
