"use client"

import * as React from "react"
import { ChevronDown, Pencil, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface Capitulo {
  id: string
  titulo: string
  contenido: string
}

interface CapituloItemProps {
  capitulo: Capitulo
  numero: number
  onDelete: () => Promise<void> | void
  onSave: (texto: string) => Promise<void> | void
}

export function CapituloItem({ capitulo, numero, onDelete, onSave }: CapituloItemProps) {
  const [abierto, setAbierto] = React.useState(false)
  const [editando, setEditando] = React.useState(false)
  const [texto, setTexto] = React.useState(capitulo.contenido)

  // Sync state if content changes from parent
  React.useEffect(() => {
    setTexto(capitulo.contenido)
  }, [capitulo.contenido])

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header colapsable */}
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
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
              <div className="flex gap-2 justify-end">
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
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/80">
                {capitulo.contenido || <em className="text-muted-foreground">Capítulo vacío. Hacé clic en &quot;Editar&quot; para escribir.</em>}
              </p>
              <div className="flex gap-2 mt-4 pt-3 border-t">
                <Button variant="outline" size="sm" type="button" onClick={() => setEditando(true)}>
                  <Pencil className="size-3.5 mr-1" /> Editar
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
            </div>
          )}
        </div>
      )}
    </div>
  )
}
