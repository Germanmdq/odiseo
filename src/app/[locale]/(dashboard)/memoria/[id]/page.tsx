import { redirect } from "next/navigation"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
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
  narrador: "Creador de escenas",
  pregunta: "Preguntas",
  plan: "Tu plan",
  manual: "Manual",
  questions: "Preguntas",
  book: "Mi libro",
  evaluacion: "Evaluación",
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
  const label = getTypeLabel(memoria.item_type, memoria.source)
  const fecha = formatDistanceToNow(new Date(memoria.created_at), { addSuffix: true, locale: es })

  return (
    <div className="px-4 md:px-6 max-w-2xl mx-auto py-2">
      {/* Back link */}
      <Link
        href={`/${locale}/memoria`}
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 hover:opacity-80 transition-opacity"
        style={{ color: "#E8401A" }}
      >
        ← Volver a Memoria
      </Link>

      {/* Badge + fecha */}
      <div className="flex items-center gap-3 mb-8">
        <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <span className="text-xs text-muted-foreground">{fecha}</span>
      </div>

      {/* Content */}
      <article
        className="prose dark:prose-invert max-w-none"
        style={{
          fontSize: "15px",
          lineHeight: "1.8",
        }}
      >
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="text-xl font-bold mt-8 mb-3">{children}</h1>,
            h2: ({ children }) => <h2 className="text-lg font-semibold mt-6 mb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-base font-semibold mt-5 mb-2">{children}</h3>,
            p: ({ children }) => <p className="mb-4 text-foreground/90">{children}</p>,
            ul: ({ children }) => <ul className="mb-4 pl-5 space-y-1 list-disc">{children}</ul>,
            ol: ({ children }) => <ol className="mb-4 pl-5 space-y-1 list-decimal">{children}</ol>,
            li: ({ children }) => <li className="text-foreground/90">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          }}
        >
          {text || "(sin contenido)"}
        </ReactMarkdown>
      </article>
    </div>
  )
}
