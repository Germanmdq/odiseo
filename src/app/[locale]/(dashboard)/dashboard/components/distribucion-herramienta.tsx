"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const toolData = [
  { herramienta: "coach", valor: 0, fill: "var(--color-coach)" },
  { herramienta: "narrador", valor: 0, fill: "var(--color-narrador)" },
  { herramienta: "diario", valor: 0, fill: "var(--color-diario)" },
  { herramienta: "notas", valor: 0, fill: "var(--color-notas)" },
  { herramienta: "otros", valor: 0, fill: "var(--color-otros)" },
]

const chartConfig = {
  herramienta: { label: "Herramienta" },
  coach: { label: "Coach", color: "var(--chart-1)" },
  narrador: { label: "Narrador", color: "var(--chart-2)" },
  diario: { label: "Diario", color: "var(--chart-3)" },
  notas: { label: "Notas", color: "var(--chart-4)" },
  otros: { label: "Otros", color: "var(--chart-5)" },
}

export function DistribucionHerramienta() {
  const t = useTranslations("dashboard.home")
  const id = "distribucion-herramienta"

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="pb-2">
        <CardTitle>{t("distribucionTitle")}</CardTitle>
        <CardDescription>{t("distribucionSub")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[220px]"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={toolData}
              dataKey="valor"
              nameKey="herramienta"
              innerRadius={60}
              strokeWidth={4}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
                          0
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">
                          {t("sesiones")}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="w-full space-y-2">
          {toolData.map((item) => {
            const cfg = chartConfig[item.herramienta as keyof typeof chartConfig]
            return (
              <div key={item.herramienta} className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: `var(--color-${item.herramienta})` }}
                  />
                  <span className="text-sm font-medium">{"label" in cfg ? cfg.label : item.herramienta}</span>
                </div>
                <span className="text-sm text-muted-foreground">0%</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
