"use client"

import * as React from "react"
import { ChevronDown, Loader2, Pencil, Sparkles, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface Capitulo {
  id: string
  titulo: string
  contenido: string
  orden: number
  created_at: string
}

interface CapituloItemProps {
  capitulo: Capitulo
  numero: number
  onDelete: () => Promise<void> | void
  onSave: (texto: string) => Promise<void> | void
  onImprove: (capitulo: Capitulo, instruccion: string) => Promise<string>
}

export function CapituloItem({ capitulo, numero, onDelete, onSave, onImprove }: CapituloItemProps) {
  const [abierto, setAbierto] = React.useState(false)
  const [editando, setEditando] = React.useState(false)
  const [texto, setTexto] = React.useState(capitulo.contenido)
  const [asistenteAbierto, setAsistenteAbierto] = React.useState(false)
  const [instruccion, setInstruccion] = React.useState("")
  const [mejorando, setMejorando] = React.useState(false)
  const [errorAsistente, setErrorAsistente] = React.useState<string | null>(null)

  // Sync state if content changes from parent
  React.useEffect(() => {
    setTexto(capitulo.contenido)
  }, [capitulo.contenido])

  async function handleImprove() {
    const instruccionTrim = instruccion.trim()
    if (!instruccionTrim || mejorando) return
    setMejorando(true)
    setErrorAsistente(null)
    try {
      const nuevoContenido = await onImprove(capitulo, instruccionTrim)
      setTexto(nuevoContenido)
      setEditando(false)
      setInstruccion("")
      setAsistenteAbierto(false)
    } catch {
      setErrorAsistente("No se pudo modificar. Probá con una instrucción más corta.")
    } finally {
      setMejorando(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-card shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
      {/* Header colapsable */}
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs text-muted-foreground font-mono shrink-0">
            {String(numero).padStart(2, "0")}
          </span>
          <span className="font-medium text-sm truncate">{capitulo.titulo}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ChevronDown className={cn("size-4 transition-transform text-muted-foreground", abierto && "rotate-180")} />
        </div>
      </button>

      {/* Contenido expandido */}
      {abierto && (
        <div className="border-t">
          {editando ? (
            <div className="p-4 space-y-3">
              <Textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                className="min-h-[200px] text-sm leading-relaxed resize-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <div className="flex flex-col justify-end gap-2 sm:flex-row">
                <Button variant="outline" size="sm" type="button" onClick={() => setEditando(false)}>
                  Cancelar
                </Button>
                <Button size="sm" type="button" onClick={() => { onSave(texto); setEditando(false) }}>
                  Guardar
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-foreground/80">
                {capitulo.contenido || <em className="text-muted-foreground">Capítulo vacío. Hacé clic en &quot;Editar&quot; para escribir.</em>}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 border-t pt-3">
                <Button variant="outline" size="sm" type="button" onClick={() => setEditando(true)}>
                  <Pencil className="size-3.5 mr-1" /> Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setAsistenteAbierto((open) => !open)}
                >
                  <Sparkles className="size-3.5 mr-1" /> Modificar con asistente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  onClick={onDelete}
                >
                  <Trash2 className="size-3.5 mr-1" /> Eliminar
                </Button>
              </div>
              {asistenteAbierto ? (
                <div className="mt-3 space-y-2 rounded-xl border border-black/10 bg-muted/30 p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Decile qué parte querés cambiar. Ej: “hacelo más simple”, “agregá un cierre más profundo”, “reescribí el segundo párrafo”.
                  </p>
                  <Textarea
                    value={instruccion}
                    onChange={(e) => setInstruccion(e.target.value)}
                    rows={3}
                    className="resize-none text-sm"
                    placeholder="¿Qué querés que modifique?"
                  />
                  {errorAsistente ? (
                    <p className="text-xs text-destructive">{errorAsistente}</p>
                  ) : null}
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => setAsistenteAbierto(false)}
                      disabled={mejorando}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      type="button"
                      onClick={handleImprove}
                      disabled={mejorando || !instruccion.trim()}
                      style={{ backgroundColor: "#E8401A", color: "#fff" }}
                    >
                      {mejorando ? (
                        <Loader2 className="size-3.5 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="size-3.5 mr-1" />
                      )}
                      Aplicar cambio
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
