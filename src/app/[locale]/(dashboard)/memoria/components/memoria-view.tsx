"use client"

import * as React from "react"
import { Brain, Search, Trash2, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { useLocale } from "next-intl"

import { Input } from "@/components/ui/input"

type Memoria = {
  id: string
  item_type: string
  title: string | null
  content: { text?: string; meta?: Record<string, unknown> } | string
  source: string
  created_at: string
}

const TYPE_LABELS: Record<string, string> = {
  coach: "Coach",
  narrador: "Narrador",
  creador: "Creador de escenas",
  pregunta: "Preguntas",
  evaluacion: "Evaluación",
  plan: "Plan",
  fuente: "Fuentes",
  biblia: "Biblia metafísica",
  "mi-libro": "Mi libro",
  manual: "Manual",
}

const TYPE_COLORS: Record<string, string> = {
  coach: "bg-orange-50 text-[#E8401A] border border-orange-100 dark:bg-[#E8401A]/10 dark:text-orange-400 dark:border-transparent",
  narrador: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  creador: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  pregunta: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  evaluacion: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  plan: "bg-orange-50 text-[#E8401A] border border-orange-100 dark:bg-[#E8401A]/10 dark:text-orange-400 dark:border-transparent",
  fuente: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  biblia: "bg-orange-50 text-[#E8401A] border border-orange-100 dark:bg-[#E8401A]/10 dark:text-orange-400 dark:border-transparent",
  "mi-libro": "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  manual: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
}

function getContentText(content: Memoria["content"]): string {
  if (!content) return ""
  if (typeof content === "string") return content
  return content.text ?? ""
}

function getTypeLabel(tipo: string, source: string): string {
  return TYPE_LABELS[tipo] ?? source ?? "Otro"
}

function getTypeBadgeClass(tipo: string): string {
  return TYPE_COLORS[tipo] ?? "bg-muted text-muted-foreground"
}

export function MemoriaView() {
  const locale = useLocale()
  const [memorias, setMemorias] = React.useState<Memoria[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetch("/api/memoria")
      .then((r) => r.json())
      .then((d: { memorias?: Memoria[]; error?: string }) => {
        if (d.error) setError(d.error)
        else setMemorias(d.memorias ?? [])
      })
      .catch(() => setError("No se pudo cargar la memoria."))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault()
    e.stopPropagation()
    setDeletingId(id)
    try {
      const res = await fetch(`/api/memoria/${id}`, { method: "DELETE" })
      if (!res.ok) return
      setMemorias((prev) => prev.filter((m) => m.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = React.useMemo(() => {
    if (!search.trim()) return memorias
    const q = search.toLowerCase()
    return memorias.filter(
      (m) =>
        getContentText(m.content).toLowerCase().includes(q) ||
        m.source.toLowerCase().includes(q) ||
        getTypeLabel(m.item_type, m.source).toLowerCase().includes(q)
    )
  }, [memorias, search])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Cargando memorias...
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
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar en tu memoria..."
          className="pl-9"
        />
        {search ? (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <Brain className="size-10 text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm">
            {memorias.length === 0
              ? "Todavía no guardaste ninguna memoria. Usá el botón 🔖 en Coach, el Creador de escenas o Preguntas."
              : "No hay memorias que coincidan con la búsqueda."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => {
            const text = getContentText(m.content)
            return (
              <Link
                key={m.id}
                href={`/${locale}/memoria/${m.id}`}
                className="group relative rounded-lg border bg-card p-4 hover:shadow-sm hover:border-primary/30 transition-all block"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: "#E8401A" }}
                  >
                    {getTypeLabel(m.item_type, m.source)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => void handleDelete(e, m.id)}
                    disabled={deletingId === m.id}
                    className="shrink-0 opacity-0 group-hover:opacity-100 rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    title="Eliminar"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <p className="text-sm leading-relaxed line-clamp-3 text-foreground/80">
                  {text || "(sin contenido)"}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(m.created_at), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
