"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const temas = [
  { id: 1, titulo: "Dinero" },
  { id: 2, titulo: "Provisión Divina" },
  { id: 3, titulo: "Causalidad Mental" },
  { id: 4, titulo: "Vivir desde el Final" },
  { id: 5, titulo: "Autoconcepto" },
]

export function MasExplorado() {
  const t = useTranslations("dashboard.home")

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>{t("masExploradoTitle")}</CardTitle>
          <CardDescription>{t("masExploradoSub")}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {temas.map((tema, index) => (
          <div key={tema.id} className="flex items-center gap-3 p-3 rounded-lg border">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
              #{index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{tema.titulo}</p>
              <p className="text-xs text-muted-foreground">0 {t("exploraciones")}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
