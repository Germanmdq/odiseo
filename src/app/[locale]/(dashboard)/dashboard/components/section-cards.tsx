import { BookOpen, Brain, CalendarCheck, MessageSquareText } from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const stats = [
  {
    icon: CalendarCheck,
    label: "Días en práctica",
    value: "0",
    sub: "Racha activa: —",
  },
  {
    icon: MessageSquareText,
    label: "Sesiones con el Coach",
    value: "0",
    sub: "Ninguna sesión aún",
  },
  {
    icon: Brain,
    label: "Memorias guardadas",
    value: "0",
    sub: "Sin memorias registradas",
  },
  {
    icon: BookOpen,
    label: "Entradas en el Diario",
    value: "0",
    sub: "Empezá a escribir hoy",
  },
]

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="@container/card">
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                <Icon className="size-3.5 text-muted-foreground" />
                {stat.label}
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {stat.value}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}
