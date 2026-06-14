"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { useTranslations } from "next-intl"
import { BookOpen, MessageSquareText, Quote, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const emptyData = [
  { mes: "Ene", valor: 0 },
  { mes: "Feb", valor: 0 },
  { mes: "Mar", valor: 0 },
  { mes: "Abr", valor: 0 },
  { mes: "May", valor: 0 },
  { mes: "Jun", valor: 0 },
]

const chartConfig = {
  valor: { label: "Actividad", color: "var(--chart-1)" },
}

const tabs = ["practica", "autoconcepto", "promesa"] as const

export function CustomerInsights() {
  const t = useTranslations("dashboard.home")
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("practica")

  const tabLabels: Record<(typeof tabs)[number], string> = {
    practica: t("nivelPractica"),
    autoconcepto: t("nivelAutoconcepto"),
    promesa: t("nivelPromesa"),
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>{t("progresoTitle")}</CardTitle>
        <CardDescription>{t("progresoSub")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as (typeof tabs)[number])} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-lg h-12">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="cursor-pointer flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">{tabLabels[tab]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-8 space-y-6">
              <div className="grid grid-cols-10 gap-6">
                <div className="col-span-10 xl:col-span-7">
                  <h3 className="text-sm font-medium text-muted-foreground mb-6">{t("actividadMensual")}</h3>
                  <ChartContainer config={chartConfig} className="h-[375px] w-full">
                    <BarChart data={emptyData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="mes"
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: "var(--border)" }}
                        axisLine={{ stroke: "var(--border)" }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: "var(--border)" }}
                        axisLine={{ stroke: "var(--border)" }}
                        domain={[0, 10]}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="valor" fill="var(--color-valor)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </div>

                <div className="col-span-10 xl:col-span-3 space-y-5">
                  <h3 className="text-sm font-medium text-muted-foreground mb-6">{t("keyMetrics")}</h3>
                  <div className="grid grid-cols-3 gap-5 xl:grid-cols-1">
                    <div className="p-4 rounded-lg col-span-3 xl:col-span-1 border">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{t("contenidosExplorados")}</span>
                      </div>
                      <div className="text-2xl font-bold">0</div>
                    </div>
                    <div className="p-4 rounded-lg col-span-3 xl:col-span-1 border">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquareText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{t("testimoniosLeidos")}</span>
                      </div>
                      <div className="text-2xl font-bold">0</div>
                    </div>
                    <div className="p-4 rounded-lg col-span-3 xl:col-span-1 border">
                      <div className="flex items-center gap-2 mb-2">
                        <Quote className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{t("frasesGuardadas")}</span>
                      </div>
                      <div className="text-2xl font-bold">0</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
