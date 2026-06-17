import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

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

function getContentText(content: Memoria["content"]): string {
  if (!content) return ""
  if (typeof content === "string") return content
  if (typeof content === "object" && "text" in content) return content.text ?? ""
  return ""
}

function getTypeLabel(tipo: string, source: string): string {
  return TYPE_LABELS[tipo] ?? source ?? "Otro"
}

export default async function MemoriaDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: memoria } = await supabase
    .from("memoria")
    .select("id, item_type, title, content, source, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (!memoria) redirect(`/${locale}/memoria`)

  const text = getContentText((memoria as Memoria).content)
  const tipoLabel = getTypeLabel(memoria.item_type, memoria.source)
  const fecha = formatDistanceToNow(new Date(memoria.created_at), { addSuffix: true, locale: es })

  const contentObj = typeof memoria.content === "object" && memoria.content !== null ? (memoria.content as { text?: string; meta?: Record<string, unknown> }) : null
  const metaUrl = contentObj?.meta?.url as string | undefined

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href={`/${locale}/memoria`} className="text-sm text-primary">
          ← Volver a Memoria
        </Link>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3">
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: "#E8401A" }}
        >
          {tipoLabel}
        </span>
        <span className="text-xs text-muted-foreground">{fecha}</span>
      </div>

      {/* Extracto */}
      <p className="text-base leading-relaxed text-foreground/80">
        {text || "(sin contenido)"}
      </p>

      {/* Botón Ver fuente */}
      {metaUrl && (
        <Link
          href={metaUrl}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary px-4 py-2 text-sm text-primary hover:bg-primary hover:text-white transition-colors"
        >
          Ver fuente completa →
        </Link>
      )}
    </div>
  )
}
