"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, StickyNote, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { ReutilizarEnButton } from "@/components/reutilizar-en-button"

type Nota = { id: string; content: string; created_at: string; updated_at: string }

function NotaItem({ nota, onDelete }: { nota: Nota, onDelete: () => void }) {
  const [expandida, setExpandida] = useState(false)
  
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <button
        onClick={() => setExpandida(!expandida)}
        className="w-full text-left p-4 cursor-pointer"
      >
        <p className={cn(
          "text-sm leading-relaxed whitespace-pre-wrap",
          !expandida && "line-clamp-2"
        )}>
          {nota.content}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(nota.created_at), { addSuffix: true, locale: es })}
          </span>
          <ChevronDown className={cn(
            "size-4 text-muted-foreground transition-transform",
            expandida && "rotate-180"
          )} />
        </div>
      </button>
      
      {expandida && (
        <div className="border-t px-4 py-3 flex justify-between items-center">
          <ReutilizarEnButton content={nota.content} origen="notas" />
          <button
            onClick={onDelete}
            className="text-xs text-destructive hover:underline cursor-pointer font-medium"
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  )
}

export default function NotasPage() {
  const [notas, setNotas] = useState<Nota[]>([])
  const [loading, setLoading] = useState(true)
  const [nueva, setNueva] = useState("")
  const [guardando, setGuardando] = useState(false)
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
      .catch(() => toast.error("Error al cargar notas"))
      .finally(() => setLoading(false))
  }, [])

  async function handleAgregar() {
    if (!nueva.trim()) return
    setGuardando(true)
    try {
      const r = await fetch("/api/notas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: nueva }),
      })
      const nota = await r.json()
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
    } catch {
      toast.error("Error al eliminar")
    }
  }

  return (
    <div className="space-y-6 px-4 lg:px-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Notas</h1>
        <p className="text-muted-foreground">Tus apuntes personales de práctica.</p>
      </div>

      {/* Nueva nota */}
      <div className="space-y-2">
        <Textarea
          ref={textareaRef}
          placeholder="Escribí una nota..."
          value={nueva}
          onChange={e => setNueva(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAgregar() }}
          rows={3}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button onClick={handleAgregar} disabled={guardando || !nueva.trim()} className="cursor-pointer gap-2">
            <Plus className="h-4 w-4" />
            Agregar nota
          </Button>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-muted-foreground text-sm">Cargando...</p>
      ) : notas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <StickyNote className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Todavía no tenés notas. Escribí la primera arriba.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notas.map(nota => (
            <NotaItem key={nota.id} nota={nota} onDelete={() => handleEliminar(nota.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
