"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

export function RevenueBreakdown() {
  const t = useTranslations("dashboard.home")
  const id = "distribucion-herramienta"
  const [activeKey, setActiveKey] = React.useState("coach")

  const activeIndex = React.useMemo(
    () => Math.max(0, toolData.findIndex((item) => item.herramienta === activeKey)),
    [activeKey]
  )

  const keys = React.useMemo(() => toolData.map((item) => item.herramienta), [])

  return (
    <Card data-chart={id} className="flex flex-col cursor-pointer">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-2">
        <div>
          <CardTitle>{t("distribucionTitle")}</CardTitle>
          <CardDescription>{t("distribucionSub")}</CardDescription>
        </div>
        <Select value={activeKey} onValueChange={setActiveKey}>
          <SelectTrigger className="w-[160px] rounded-lg cursor-pointer" aria-label="Select tool">
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-lg">
            {keys.map((key) => {
              const cfg = chartConfig[key as keyof typeof chartConfig]
              return (
                <SelectItem key={key} value={key} className="rounded-md [&_span]:flex cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: `var(--color-${key})` }}
                    />
                    {"label" in cfg ? cfg.label : key}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <div className="flex justify-center">
            <ChartContainer
              id={id}
              config={chartConfig}
              className="mx-auto aspect-square w-full max-w-[300px]"
            >
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={toolData}
                  dataKey="valor"
                  nameKey="herramienta"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                              0
                            </tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-xs">
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
          </div>

          <div className="flex flex-col justify-center space-y-3">
            {toolData.map((item, index) => {
              const cfg = chartConfig[item.herramienta as keyof typeof chartConfig]
              const isActive = index === activeIndex
              return (
                <div
                  key={item.herramienta}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                    isActive ? "bg-muted" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setActiveKey(item.herramienta)}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: `var(--color-${item.herramienta})` }}
                    />
                    <span className="font-medium">{"label" in cfg ? cfg.label : item.herramienta}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">0</div>
                    <div className="text-sm text-muted-foreground">0%</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
