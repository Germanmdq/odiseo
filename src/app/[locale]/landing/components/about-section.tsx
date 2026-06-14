"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CardDecorator } from '@/components/ui/card-decorator'
import { BookOpen, CalendarCheck, Brain, BookMarked } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function AboutSection() {
  const t = useTranslations("landing.about")

  const pillars = [
    { icon: BookOpen,     title: t("pillar1Title"), description: t("pillar1Desc") },
    { icon: CalendarCheck, title: t("pillar2Title"), description: t("pillar2Desc") },
    { icon: Brain,        title: t("pillar3Title"), description: t("pillar3Desc") },
    { icon: BookMarked,   title: t("pillar4Title"), description: t("pillar4Desc") },
  ]

  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-4xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            {t("badge")}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {t("subtitle")}
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4 mb-12">
          {pillars.map((pillar, index) => (
            <Card key={index} className='group shadow-xs py-2'>
              <CardContent className='p-8'>
                <div className='flex flex-col items-center text-center'>
                  <CardDecorator>
                    <pillar.icon className='h-6 w-6' aria-hidden />
                  </CardDecorator>
                  <h3 className='mt-6 font-medium text-balance'>{pillar.title}</h3>
                  <p className='text-muted-foreground mt-3 text-sm'>{pillar.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-muted-foreground">{t("tagline")}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="cursor-pointer" asChild>
              <Link href="/auth/sign-up">
                {t("ctaPrimary")}
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="cursor-pointer" asChild>
              <a href="#features">
                {t("ctaSecondary")}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
