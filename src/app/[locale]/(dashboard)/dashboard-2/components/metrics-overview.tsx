"use client"

import { BookOpen, Brain, CalendarCheck, Flame } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function MetricsOverview() {
  const t = useTranslations("dashboard.home")
  const [memoriasCount, setMemoriasCount] = useState<number>(0)
  const [rachaActual, setRachaActual] = useState<number>(0)
  const [puntosTotal, setPuntosTotal] = useState<number>(0)

  useEffect(() => {
    fetch("/api/memoria/count")
      .then((r) => r.json())
      .then((d: { count?: number }) => setMemoriasCount(d.count ?? 0))
      .catch(() => {})

    fetch("/api/rachas")
      .then((r) => r.json())
      .then((d: { racha_actual?: number; puntos_totales?: number }) => {
        setRachaActual(d.racha_actual ?? 0)
        setPuntosTotal(d.puntos_totales ?? 0)
      })
      .catch(() => {})
  }, [])

  const metrics = [
    {
      key: "diasEnPractica",
      icon: Flame,
      footer: rachaActual > 0 ? `Racha activa` : t("rachaActual"),
      value: rachaActual,
    },
    {
      key: "memoriasGuardadas",
      icon: Brain,
      footer: t("sinMemorias"),
      value: memoriasCount,
    },
    {
      key: "entradasDiario",
      icon: BookOpen,
      footer: "Evaluaciones completadas",
      value: puntosTotal,
    },
    {
      key: "sesionesCoach",
      icon: CalendarCheck,
      footer: t("ningunaSession"),
      value: 0,
    },
  ] as const

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 @5xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.key} className="cursor-pointer">
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                <Icon className="size-3.5 text-muted-foreground" />
                {t(metric.key)}
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {metric.value}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="text-muted-foreground">{metric.footer}</div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
