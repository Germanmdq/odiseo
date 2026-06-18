"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function TalleresSection() {
  const t = useTranslations("landing.talleres")
  const params = useParams()
  const locale = (params.locale as string) ?? "es"
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
    })
  }, [])

  const handleCTAClick = () => {
    if (isLoggedIn) {
      router.push(`/${locale}/talleres`)
    } else {
      router.push(`/${locale}/auth/login`)
    }
  }

  const talleres = [
    { num: 1, title: t("taller1Title"), desc: t("taller1Desc") },
    { num: 2, title: t("taller2Title"), desc: t("taller2Desc") },
    { num: 3, title: t("taller3Title"), desc: t("taller3Desc") },
    { num: 4, title: t("taller4Title"), desc: t("taller4Desc") },
  ]

  return (
    <section id="talleres" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            {t("eyebrow")}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        {/* Workshop Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 mb-16">
          {talleres.map((taller) => (
            <Card
              key={taller.num}
              className="group py-0 border-0 rounded-[20px] bg-[#F7F7F7] shadow-[0_4px_6px_rgba(0,0,0,0.07),0_10px_15px_rgba(0,0,0,0.1),0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:shadow-[0_8px_12px_rgba(0,0,0,0.1),0_20px_40px_rgba(0,0,0,0.15),0_40px_80px_rgba(0,0,0,0.1)] transition-all duration-200"
            >
              <CardContent className="p-6">
                <div className="flex flex-col gap-5 min-h-[220px]">
                  <div className="flex items-start justify-between">
                    <span className="text-6xl font-black leading-none text-primary select-none tabular-nums">
                      {String(taller.num).padStart(2, "0")}
                    </span>
                    <Badge variant="secondary" className="text-xs shrink-0 mt-1">
                      {t("lessons")}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-2 text-foreground leading-snug">
                      {taller.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {taller.desc}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Facilitators */}
        <div className="border-t pt-12">
          <p className="text-center text-base font-semibold text-foreground mb-2">
            {t("facilitadoresLabel")}
          </p>
          <p className="text-center text-sm text-muted-foreground max-w-xl mx-auto mb-10">
            {t("facilitadoresDesc")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-10 mb-10">
            {/* Germán */}
            <div className="flex flex-col items-center gap-3">
              <div className="h-20 w-20 rounded-full overflow-hidden ring-2 ring-border shadow-sm">
                <Image
                  src="/german-gonzalez.jpg"
                  alt="Germán González"
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">{t("person1Name")}</p>
                <p className="text-sm text-muted-foreground">{t("person1Role")}</p>
              </div>
            </div>

            {/* Taty */}
            <div className="flex flex-col items-center gap-3">
              <div className="h-20 w-20 rounded-full overflow-hidden ring-2 ring-border shadow-sm">
                <Image
                  src="/taty-baldi.jpg"
                  alt="Taty Baldi"
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">{t("person2Name")}</p>
                <p className="text-sm text-muted-foreground">{t("person2Role")}</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-2">
            <Button size="lg" className="cursor-pointer" onClick={handleCTAClick}>
              {t("cta")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
