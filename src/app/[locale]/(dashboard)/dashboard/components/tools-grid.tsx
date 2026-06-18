import Link from "next/link"
import {
  BookOpen,
  Brain,
  CalendarDays,
  Cross,
  FileText,
  GraduationCap,
  HelpCircle,
  Library,
  MessageSquareText,
  ScrollText,
  Send,
  Sparkles,
  StickyNote,
  Trophy,
} from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const tools = [
  {
    href: "coach",
    icon: MessageSquareText,
    title: "Coach",
    desc: "Trabajá tu deseo con guía directa.",
  },
  {
    href: "narrador",
    icon: Sparkles,
    title: "Narrador",
    desc: "Escenas guiadas y explicaciones vivas.",
  },
  {
    href: "testimonios",
    icon: ScrollText,
    title: "Testimonios",
    desc: "Historias reales relacionadas con tu deseo.",
  },
  {
    href: "biblico",
    icon: Cross,
    title: "Biblia metafísica",
    desc: "Símbolos bíblicos como estados de conciencia.",
  },
  {
    href: "preguntas",
    icon: HelpCircle,
    title: "Preguntas",
    desc: "Integrá conceptos con preguntas y respuestas.",
  },
  {
    href: "biblioteca",
    icon: Library,
    title: "Fuentes",
    desc: "Conferencias y libros de Neville Goddard.",
  },
  {
    href: "libro",
    icon: BookOpen,
    title: "Mi libro",
    desc: "Convertí tu conocimiento en capítulos propios.",
  },
  {
    href: "planes",
    icon: CalendarDays,
    title: "Planes",
    desc: "Prácticas de 7, 15 o 30 días.",
  },
  {
    href: "telegram",
    icon: Send,
    title: "Telegram",
    desc: "Mensajes para volver al estado elegido.",
  },
  {
    href: "diario",
    icon: FileText,
    title: "Diario",
    desc: "Reflexiones íntimas de tu práctica.",
  },
  {
    href: "notas",
    icon: StickyNote,
    title: "Notas",
    desc: "Apuntes sueltos de lectura y estudio.",
  },
  {
    href: "memoria",
    icon: Brain,
    title: "Memoria",
    desc: "Todo lo que Odiseo recuerda de vos.",
  },
  {
    href: "perfil",
    icon: Trophy,
    title: "Perfil",
    desc: "Tu cuenta, plan y progreso.",
  },
  {
    href: "talleres",
    icon: GraduationCap,
    title: "Talleres",
    desc: "Programas guiados en profundidad.",
  },
] as const

export function ToolsGrid({ locale }: { locale: string }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Herramientas</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {tools.map((tool) => {
          const Icon = tool.icon
          const card = (
            <Card
              className="group cursor-pointer transition-all hover:border-primary/40 hover:shadow-md"
            >
              <CardHeader className="gap-3 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-sm font-semibold">{tool.title}</CardTitle>
                  <CardDescription className="text-xs leading-snug">
                    {tool.desc}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          )

          if ("comingSoon" in tool && tool.comingSoon) {
            return <div key={tool.href}>{card}</div>
          }

          return (
            <Link key={tool.href} href={`/${locale}/${tool.href}`} prefetch={false}>
              {card}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
