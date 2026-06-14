"use client"

import { Clock } from "lucide-react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function RecentTransactions() {
  const t = useTranslations("dashboard.home")

  return (
    <Card className="cursor-pointer">
      <CardHeader className="pb-4">
        <CardTitle>{t("actividadRecienteTitle")}</CardTitle>
        <CardDescription>{t("actividadRecienteSub")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground gap-2">
          <Clock className="size-5 opacity-40" />
          <p className="text-sm">{t("sinActividad")}</p>
          <p className="text-xs opacity-60">{t("sinActividadDesc")}</p>
        </div>
      </CardContent>
    </Card>
  )
}
