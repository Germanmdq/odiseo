"use client"

import { BookOpen, Users, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { DotPattern } from '@/components/dot-pattern'
import { useTranslations } from 'next-intl'

export function StatsSection() {
  const t = useTranslations("landing.stats")

  const stats = [
    { icon: BookOpen, value: t("stat1Value"), label: t("stat1Label"), description: t("stat1Desc") },
    { icon: Users,    value: t("stat2Value"), label: t("stat2Label"), description: t("stat2Desc") },
    { icon: FileText, value: t("stat3Value"), label: t("stat3Label"), description: t("stat3Desc") },
  ]

  return (
    <section className="py-12 sm:py-16 relative">
      {/* Background with transparency */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-secondary/20" />
      <DotPattern className="opacity-75" size="md" fadeStyle="circle" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="text-center border-0 rounded-[20px] bg-[#F7F7F7] py-0 shadow-[0_4px_6px_rgba(0,0,0,0.07),0_10px_15px_rgba(0,0,0,0.1),0_20px_40px_rgba(0,0,0,0.08)]"
            >
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {stat.value}
                  </h3>
                  <p className="font-semibold text-foreground">{stat.label}</p>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
