"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Pencil, Check, X, Plus, StickyNote } from "lucide-react"
import { toast } from "sonner"

type Nota = { id: string; content: string; created_at: string; updated_at: string }

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })
}

export default function NotasPage() {
  const [notas, setNotas] = useState<Nota[]>([])
  const [loading, setLoading] = useState(true)
  const [nueva, setNueva] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
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

  async function handleEditar(id: string) {
    if (!editContent.trim()) return
    try {
      const r = await fetch(`/api/notas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      })
      const actualizada = await r.json()
      setNotas(prev => prev.map(n => n.id === id ? actualizada : n))
      setEditId(null)
    } catch {
      toast.error("Error al guardar")
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

  function startEdit(nota: Nota) {
    setEditId(nota.id)
    setEditContent(nota.content)
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
            <Card key={nota.id} className="group">
              <CardContent className="p-4">
                {editId === nota.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      rows={3}
                      className="resize-none"
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => setEditId(null)} className="cursor-pointer">
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => handleEditar(nota.id)} className="cursor-pointer">
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <p className="flex-1 text-sm whitespace-pre-wrap leading-relaxed">{nota.content}</p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button size="icon" variant="ghost" className="h-7 w-7 cursor-pointer" onClick={() => startEdit(nota)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 cursor-pointer text-destructive hover:text-destructive" onClick={() => handleEliminar(nota.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">{formatFecha(nota.updated_at || nota.created_at)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
