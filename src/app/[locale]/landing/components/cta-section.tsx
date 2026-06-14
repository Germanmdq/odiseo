"use client"

import { ArrowRight, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function CTASection() {
  const t = useTranslations("landing.cta")

  return (
    <section className='py-16 lg:py-24 bg-muted/80'>
      <div className='container mx-auto px-4 lg:px-8'>
        <div className='mx-auto max-w-4xl'>
          <div className='text-center'>
            <div className='space-y-8'>
              {/* Badge */}
              <div className='flex flex-col items-center gap-4'>
                <Badge variant='outline' className='flex items-center gap-2'>
                  <TrendingUp className='size-3' />
                  {t("badge")}
                </Badge>
              </div>

              {/* Main Content */}
              <div className='space-y-6'>
                <h1 className='text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl'>
                  {t("title")}
                </h1>

                <p className='text-muted-foreground mx-auto max-w-2xl text-balance lg:text-xl'>
                  {t("subtitle")}
                </p>
              </div>

              {/* CTA Buttons */}
              <div className='flex flex-col justify-center gap-4 sm:flex-row sm:gap-6'>
                <Button size='lg' className='cursor-pointer px-8 py-6 text-lg font-medium' asChild>
                  <Link href='/auth/sign-up'>
                    {t("ctaPrimary")}
                    <ArrowRight className='ms-2 size-5' />
                  </Link>
                </Button>
                <Button variant='outline' size='lg' className='cursor-pointer px-8 py-6 text-lg font-medium group' asChild>
                  <Link href='/auth/sign-in'>
                    {t("ctaSecondary")}
                    <ArrowRight className='ms-2 size-4 transition-transform group-hover:translate-x-1' />
                  </Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className='text-muted-foreground flex flex-wrap items-center justify-center gap-6 text-sm'>
                <div className='flex items-center gap-2'>
                  <div className='size-2 rounded-full bg-green-600 dark:bg-green-400 me-1' />
                  <span>{t("trust1")}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='size-2 rounded-full bg-blue-600 dark:bg-blue-400 me-1' />
                  <span>{t("trust2")}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='size-2 rounded-full bg-purple-600 dark:bg-purple-400 me-1' />
                  <span>{t("trust3")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
