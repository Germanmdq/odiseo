"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const emptyData = [
  { mes: "Ene", dias: 0 },
  { mes: "Feb", dias: 0 },
  { mes: "Mar", dias: 0 },
  { mes: "Abr", dias: 0 },
  { mes: "May", dias: 0 },
  { mes: "Jun", dias: 0 },
  { mes: "Jul", dias: 0 },
  { mes: "Ago", dias: 0 },
  { mes: "Sep", dias: 0 },
  { mes: "Oct", dias: 0 },
  { mes: "Nov", dias: 0 },
  { mes: "Dic", dias: 0 },
]

const chartConfig = {
  dias: {
    label: "Días practicados",
    color: "var(--primary)",
  },
}

export function ActividadChart() {
  const t = useTranslations("dashboard.home")
  const [rango, setRango] = useState("12m")

  const filtered =
    rango === "3m" ? emptyData.slice(-3) : rango === "6m" ? emptyData.slice(-6) : emptyData

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>{t("actividadTitle")}</CardTitle>
          <CardDescription>{t("actividadSub")}</CardDescription>
        </div>
        <Select value={rango} onValueChange={setRango}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">{t("last3m")}</SelectItem>
            <SelectItem value="6m">{t("last6m")}</SelectItem>
            <SelectItem value="12m">{t("last12m")}</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-0 pt-6">
        <div className="px-6 pb-6">
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={filtered} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDias" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-dias)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-dias)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis
                dataKey="mes"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                domain={[0, 31]}
                tickCount={5}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="dias"
                stroke="var(--color-dias)"
                fill="url(#colorDias)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
