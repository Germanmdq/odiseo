"use client"

import {
  MessageSquareText,
  Mic,
  BookOpen,
  CalendarCheck,
  Users,
  Brain,
  Send,
  BookMarked,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'

export function FeaturesSection() {
  const t = useTranslations("landing.features")
  const params = useParams()
  const locale = (params.locale as string) ?? "es"

  const block1Features = [
    { icon: MessageSquareText, title: t("f1Title"), description: t("f1Desc") },
    { icon: Mic,               title: t("f2Title"), description: t("f2Desc") },
    { icon: BookOpen,          title: t("f3Title"), description: t("f3Desc") },
    { icon: CalendarCheck,     title: t("f4Title"), description: t("f4Desc") },
  ]

  const block2Features = [
    { icon: Users,      title: t("f5Title"), description: t("f5Desc") },
    { icon: Brain,      title: t("f6Title"), description: t("f6Desc") },
    { icon: Send,       title: t("f7Title"), description: t("f7Desc") },
    { icon: BookMarked, title: t("f8Title"), description: t("f8Desc") },
  ]

  return (
    <section id="features" className="py-24 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">{t("badge")}</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        {/* First Feature Section */}
        <div className="mb-24 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 min-w-0 space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                  {t("block1Title")}
                </h3>
                <p className="text-muted-foreground text-base text-pretty">
                  {t("block1Desc")}
                </p>
              </div>

              <ul className="grid gap-4 sm:grid-cols-2">
                {block1Features.map((feature, index) => (
                  <li key={index} className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors">
                    <div className="mt-0.5 flex shrink-0 items-center justify-center">
                      <feature.icon className="size-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-foreground font-medium">{feature.title}</h3>
                      <p className="text-muted-foreground mt-1 text-sm">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4 pe-4 pt-2">
                <Button size="lg" className="cursor-pointer" asChild>
                  <Link href={`/${locale}/registro`} className='flex items-center'>
                    {t("cta1Primary")}
                    <ArrowRight className="ms-2 size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="cursor-pointer" asChild>
                  <Link href={`/${locale}/coach`}>
                    {t("cta1Secondary")}
                  </Link>
                </Button>
              </div>
            </div>
            <div className="w-full md:w-[40%] shrink-0">
              <Image
                src="/ilustracion-conversacion.jpg"
                alt=""
                width={640}
                height={640}
                className="w-full h-full object-contain"
                style={{ mixBlendMode: "multiply" }}
              />
            </div>
          </div>
        </div>

        {/* Second Feature Section */}
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-[40%] shrink-0 order-last md:order-first">
              <Image
                src="/ilustracion-mente.jpg"
                alt=""
                width={640}
                height={640}
                className="w-full h-full object-contain"
                style={{ mixBlendMode: "multiply" }}
              />
            </div>
            <div className="flex-1 min-w-0 space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                  {t("block2Title")}
                </h3>
                <p className="text-muted-foreground text-base text-pretty">
                  {t("block2Desc")}
                </p>
              </div>

              <ul className="grid gap-4 sm:grid-cols-2">
                {block2Features.map((feature, index) => (
                  <li key={index} className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors">
                    <div className="mt-0.5 flex shrink-0 items-center justify-center">
                      <feature.icon className="size-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-foreground font-medium">{feature.title}</h3>
                      <p className="text-muted-foreground mt-1 text-sm">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4 pe-4 pt-2">
                <Button size="lg" className="cursor-pointer" asChild>
                  <Link href={`/${locale}/registro`} className='flex items-center'>
                    {t("cta2Primary")}
                    <ArrowRight className="ms-2 size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="cursor-pointer" asChild>
                  <a href="#features">
                    {t("cta2Secondary")}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
