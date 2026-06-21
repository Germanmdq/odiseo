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
import { CompartidoEnLibroDialog } from "./compartido-en-libro-dialog"
import { PersonalSubtitle } from "@/components/personal-subtitle"

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

// Contenido compartido pendiente de colocar en un libro. A nivel de módulo
// (no estado/ref por instancia) para sobrevivir re-montajes del App Router:
// si una instancia se descarta, la viva sigue encontrando el contenido acá.
let miLibroPendingShared: string | null = null
// Timer para descartar el contenido al desmontar de verdad (navegar afuera).
// Si es un re-montaje inmediato, el próximo montaje lo cancela a tiempo.
let miLibroClearTimer: ReturnType<typeof setTimeout> | null = null

export function MisLibrosView({ activeLibroId }: MisLibrosViewProps) {
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as string) ?? "es"

  const [libros, setLibros] = React.useState<Libro[]>([])
  const [capitulos, setCapitulos] = React.useState<Capitulo[]>([])
  const [loadingLibros, setLoadingLibros] = React.useState(true)
  const [loadingCapitulos, setLoadingCapitulos] = React.useState(false)
  const [creandoLibro, setCreandoLibro] = React.useState(false)

  // Asistente Generation State
  const [tema, setTema] = React.useState("")
  const [generando, setGenerando] = React.useState(false)
  const [draftTitulo, setDraftTitulo] = React.useState("")
  const [draftContenido, setDraftContenido] = React.useState("")
  const [showDraft, setShowDraft] = React.useState(false)
  const [savingDraft, setSavingDraft] = React.useState(false)
  // Contenido compartido (p.ej. desde Coach) pendiente de colocar en un libro
  const [compartidoOpen, setCompartidoOpen] = React.useState(false)
  const [sharedContenido, setSharedContenido] = React.useState("")
  // true mientras navegamos hacia un libro (crear/seleccionar): evita descartar
  // el contenido pendiente en el desmontaje provocado por esa navegación.
  const navigatingToBookRef = React.useRef(false)

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

  // Contenido compartido desde otra herramienta (Coach, Fuentes, etc.).
  // Se consume de sessionStorage a una variable de módulo (sobrevive
  // re-montajes) y se abre el modal de "agregar a libro". La key se borra al
  // leerla; el contenido vive en la variable de módulo hasta guardar o cerrar.
  React.useEffect(() => {
    // Si había una limpieza diferida programada por un desmontaje anterior
    // (o un re-montaje del App Router), cancelarla: esta instancia está viva.
    if (miLibroClearTimer) {
      clearTimeout(miLibroClearTimer)
      miLibroClearTimer = null
    }

    const incoming = sessionStorage.getItem("odiseo_reutilizar")
    if (incoming) {
      sessionStorage.removeItem("odiseo_reutilizar")
      try {
        const { content } = JSON.parse(incoming) as { content?: string }
        if (content && content.trim()) miLibroPendingShared = content
      } catch (e) {
        console.error("[mi-libro] odiseo_reutilizar no es JSON válido:", incoming, e)
      }
    }
    // Compatibilidad: por si quedó una key vieja de una sesión anterior.
    const legacy = sessionStorage.getItem("odiseo_milibro_pending")
    if (legacy) {
      sessionStorage.removeItem("odiseo_milibro_pending")
      try {
        const { content } = JSON.parse(legacy) as { content?: string }
        if (content && content.trim()) miLibroPendingShared = content
      } catch (e) {
        console.error("[mi-libro] odiseo_milibro_pending inválido:", e)
      }
    }

    if (miLibroPendingShared) {
      // Contenido completo, SIN truncar: se usa como fuente real para generar.
      setSharedContenido(miLibroPendingShared)
      setCompartidoOpen(true)
    }
  }, [])

  // Al salir de Mi libro sin ir hacia un libro (crear/seleccionar), descartar el
  // contenido pendiente para que no persiga al usuario a otras secciones.
  // La limpieza de la variable de módulo se difiere para distinguir un
  // desmontaje real (navegación afuera) de un re-montaje inmediato: si vuelve a
  // montar, el efecto de arriba cancela el timer antes de que limpie.
  React.useEffect(() => {
    return () => {
      if (!navigatingToBookRef.current) {
        sessionStorage.removeItem("odiseo_milibro_pending")
      }
      miLibroClearTimer = setTimeout(() => {
        miLibroPendingShared = null
        miLibroClearTimer = null
      }, 0)
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

  function escapeHtml(value: string) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
  }

  function handleDownloadPdf() {
    if (!libroActivo) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const chapterBlocks = capitulos
      .map((capitulo, index) => {
        const paragraphs = capitulo.contenido
          .split(/\n{2,}/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean)
          .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
          .join("")

        return `
          <article class="chapter">
            <p class="chapter-number">Capítulo ${index + 1}</p>
            <h2>${escapeHtml(capitulo.titulo)}</h2>
            ${paragraphs || "<p><em>Capítulo vacío.</em></p>"}
          </article>
        `
      })
      .join("")

    const indexItems = capitulos
      .map((capitulo, index) => `<li>${index + 1}. ${escapeHtml(capitulo.titulo)}</li>`)
      .join("")

    printWindow.document.write(`
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>${escapeHtml(libroActivo.titulo)} - Odiseo</title>
          <style>
            @page { margin: 22mm 18mm; }
            body {
              color: #111;
              font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
              line-height: 1.65;
              margin: 0;
            }
            .cover {
              border-bottom: 2px solid #111;
              margin-bottom: 28px;
              padding-bottom: 24px;
            }
            .brand {
              color: #E8401A;
              font-size: 12px;
              font-weight: 800;
              letter-spacing: 0.14em;
              text-transform: uppercase;
            }
            h1 {
              font-size: 36px;
              line-height: 1.1;
              margin: 16px 0 8px;
            }
            .meta {
              color: #666;
              font-size: 13px;
            }
            .index {
              break-after: page;
              margin-bottom: 30px;
            }
            .index h2,
            .chapter h2 {
              font-size: 22px;
              margin: 0 0 12px;
            }
            .index li {
              margin: 8px 0;
            }
            .chapter {
              break-before: page;
            }
            .chapter-number {
              color: #E8401A;
              font-size: 12px;
              font-weight: 800;
              letter-spacing: 0.1em;
              margin: 0 0 8px;
              text-transform: uppercase;
            }
            p {
              font-size: 15px;
              margin: 0 0 14px;
            }
          </style>
        </head>
        <body>
          <section class="cover">
            <div class="brand">Odiseo</div>
            <h1>${escapeHtml(libroActivo.titulo)}</h1>
            <p class="meta">${capitulos.length} capítulos · ${new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}</p>
          </section>
          <section class="index">
            <h2>Índice</h2>
            <ol>${indexItems}</ol>
          </section>
          ${chapterBlocks}
          <script>
            window.onload = () => {
              window.print();
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

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
      navigatingToBookRef.current = true
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

      if (res.status === 403) {
        window.location.href = `/${locale}/pricing`
        return
      }

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

  const handleImproveChapter = async (capitulo: Capitulo, instruccion: string) => {
    const res = await fetch("/api/mi-libro/modificar-capitulo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: capitulo.titulo,
        contenido: capitulo.contenido,
        instruccion,
      }),
    })

    if (res.status === 403) {
      window.location.href = `/${locale}/pricing`
      throw new Error("paywall")
    }

    const data = (await res.json()) as { contenido?: string; error?: string }
    if (!res.ok || !data.contenido) {
      throw new Error(data.error ?? "No se pudo modificar")
    }

    const saveRes = await fetch(`/api/mi-libro/capitulos/${capitulo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contenido: data.contenido }),
    })
    const saved = (await saveRes.json()) as { capitulo?: Capitulo }
    if (!saveRes.ok || !saved.capitulo) {
      throw new Error("No se pudo guardar")
    }

    setCapitulos((prev) =>
      prev.map((current) =>
        current.id === capitulo.id ? { ...current, contenido: saved.capitulo!.contenido } : current
      )
    )

    return saved.capitulo.contenido
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
    <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-black/10 bg-card text-card-foreground shadow-[0_8px_28px_rgba(0,0,0,0.08)] md:h-[calc(100vh-160px)] md:min-h-[500px] md:grid-cols-[280px_1fr]">
      {/* Columna Izquierda: Listado de Libros */}
      <div
        className={cn(
          "flex flex-col border-r bg-muted/10 md:h-full",
          activeLibroId ? "hidden md:flex" : "flex"
        )}
      >
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Mis libros</h2>
          <PersonalSubtitle
            className="text-xs text-muted-foreground mt-0.5"
            conNombre="{nombre}, esta es tu biblioteca personal."
            sinNombre="Tu biblioteca personal."
          />
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
                onClick={() => {
                  navigatingToBookRef.current = true
                  router.push(`/${locale}/mi-libro/${libro.id}`)
                }}
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
          "flex flex-col bg-background md:h-full md:overflow-hidden",
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
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Elegí un libro de la lista lateral o creá uno nuevo.
            </p>
          </div>
        ) : (
          <div className="flex flex-col md:h-full md:overflow-hidden">
            {/* Header del libro */}
            <div className="flex items-center gap-4 border-b bg-card p-4 md:shrink-0 md:p-6">
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
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={capitulos.length === 0}
                >
                  <Download className="size-4 mr-1.5" />
                  <span className="sm:hidden">PDF</span>
                  <span className="hidden sm:inline">Descargar PDF</span>
                </Button>
              </div>
            </div>

            {/* Formulario e Editor de Borrador (Condicional) */}
            {showDraft ? (
              <div className="max-h-[520px] space-y-4 overflow-y-auto border-b bg-muted/20 p-4 md:max-h-[300px] md:shrink-0 md:p-6">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-xs md:text-sm text-muted-foreground flex items-center gap-2">
                    {generando ? (
                      <>
                        <Loader2 className="size-4 animate-spin text-[#E8401A]" />
                        {`Generando capítulo sobre "${tema}"…`}
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
              /* Agregar capítulo con Asistente */
              <div className="border-b bg-muted/20 p-4 md:shrink-0 md:p-6">
                <p className="text-xs md:text-sm font-medium mb-3">
                  Agregar capítulo con Asistente
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
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
            <div className="space-y-3 bg-muted/5 p-4 md:flex-1 md:overflow-y-auto md:p-6">
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
                    onImprove={handleImproveChapter}
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

      <CompartidoEnLibroDialog
        open={compartidoOpen}
        onOpenChange={(o) => {
          setCompartidoOpen(o)
          // Cerró sin completar: se descarta el contenido pendiente (deseado).
          if (!o) miLibroPendingShared = null
        }}
        contenido={sharedContenido}
        libros={libros}
        locale={locale}
        onLibroCreado={(libro) => setLibros((prev) => [libro, ...prev])}
        onGuardado={(libroId) => {
          miLibroPendingShared = null
          setCompartidoOpen(false)
          navigatingToBookRef.current = true
          router.push(`/${locale}/mi-libro/${libroId}`)
        }}
      />
    </div>
  )
}
