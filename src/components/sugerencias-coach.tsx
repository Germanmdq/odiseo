"use client"

import { useParams, useRouter } from "next/navigation"
import { Sparkles, BookOpen, PenLine, Brain, ClipboardList, Library, Users, type LucideIcon } from "lucide-react"

export type Sugerencia = {
  label: string
  icono: keyof typeof ICONOS
  destino: string
}

const ICONOS: Record<string, LucideIcon> = {
  Sparkles,
  BookOpen,
  PenLine,
  Brain,
  ClipboardList,
  Library,
  Users,
}

const TODAS: Sugerencia[] = [
  { label: "Armá la escena de tu deseo", icono: "Sparkles", destino: "/creador-de-escenas" },
  { label: "Generá un capítulo sobre esto", icono: "BookOpen", destino: "/mi-libro" },
  { label: "Escribí cómo te sentís hoy", icono: "PenLine", destino: "/diario" },
  { label: "Poné a prueba lo que entendiste", icono: "Brain", destino: "/preguntas" },
  { label: "Pedí un plan de práctica", icono: "ClipboardList", destino: "/planes" },
  { label: "Leé las fuentes sobre esto", icono: "Library", destino: "/fuentes" },
  { label: "Mirá testimonios reales", icono: "Users", destino: "/testimonios" },
]

export function getSugerencias(mensaje: string): Sugerencia[] {
  const t = mensaje.toLowerCase()

  if (t.includes("deseo") || t.includes("quiero") || t.includes("escena") || t.includes("visuali")) {
    return [TODAS[0], TODAS[1], TODAS[4]]
  }
  if (t.includes("fe") || t.includes("autoconcepto") || t.includes("identidad") || t.includes(" soy ")) {
    return [TODAS[1], TODAS[3], TODAS[5]]
  }
  if (t.includes("testimonio") || t.includes("caso") || t.includes("ejemplo") || t.includes("alguien")) {
    return [TODAS[6], TODAS[0], TODAS[3]]
  }
  if (t.includes("plan") || t.includes("práctica") || t.includes("cómo empez") || t.includes("rutina")) {
    return [TODAS[4], TODAS[2], TODAS[0]]
  }
  if (t.includes("sats") || t.includes("dormir") || t.includes("noche") || t.includes("imaginaci")) {
    return [TODAS[0], TODAS[2], TODAS[1]]
  }

  return [TODAS[0], TODAS[1], TODAS[3]]
}

export function extraerTema(mensaje: string): string {
  const ignorar = new Set([
    "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "al",
    "que", "qué", "en", "por", "para", "con", "sin", "es", "son", "me", "mi",
    "tu", "su", "no", "sí", "si", "yo", "vos", "sos", "tengo", "tenés",
    "quiero", "quería", "necesito", "sobre", "como", "pero", "también", "muy",
    "más", "hay", "y", "o", "a", "e", "cómo", "cuándo", "dónde", "porque",
    "algo", "esto", "eso", "ese", "esta", "este", "hola", "buen", "buena",
  ])

  const palabras = mensaje
    .toLowerCase()
    .replace(/[¿?¡!.,;:]/g, "")
    .split(/\s+/)
    .filter((p) => p.length > 3 && !ignorar.has(p))

  if (palabras.length === 0) return ""
  return palabras.slice(0, 2).join(" ")
}

interface SugerenciasCoachProps {
  sugerencias: Sugerencia[]
  tema?: string
}

export function SugerenciasCoach({ sugerencias, tema }: SugerenciasCoachProps) {
  const params = useParams()
  const locale = (params.locale as string) ?? "es"
  const router = useRouter()

  const labelConTema = (label: string) =>
    tema ? label.replace("esto", tema) : label

  return (
    <div className="mt-3 border-t pt-3">
      <p className="text-xs text-muted-foreground mb-2">¿Qué hacés con esto?</p>
      <div className="flex w-full gap-2 overflow-x-auto px-1 py-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
        {sugerencias.map((s) => {
          const Icono = ICONOS[s.icono]
          return (
            <button
              key={s.destino}
              type="button"
              onClick={() => router.push(`/${locale}${s.destino}?desde=coach`)}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium sm:shrink sm:rounded-2xl sm:px-4 sm:py-3 hover:bg-muted transition-colors cursor-pointer"
            >
              {Icono && <Icono className="size-4 shrink-0" />}
              <span className="max-w-[220px] whitespace-nowrap overflow-hidden text-ellipsis">
                {labelConTema(s.label)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
