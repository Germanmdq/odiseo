"use client"

import { CircleHelp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'

const FaqSection = () => {
  const t = useTranslations("landing.faq")

  const faqItems = [
    { value: 'item-1', question: t("q1"), answer: t("a1") },
    { value: 'item-2', question: t("q2"), answer: t("a2") },
    { value: 'item-3', question: t("q3"), answer: t("a3") },
    { value: 'item-4', question: t("q4"), answer: t("a4") },
  ]

  return (
    <section id="faq" className="py-24 sm:py-32">
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

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto">
          <div className='bg-transparent'>
            <div className='p-0'>
              <Accordion type='single' collapsible className='space-y-5'>
                {faqItems.map(item => (
                  <AccordionItem key={item.value} value={item.value} className='rounded-md !border bg-transparent'>
                    <AccordionTrigger className='cursor-pointer items-center gap-4 rounded-none bg-transparent py-2 ps-3 pe-4 hover:no-underline data-[state=open]:border-b'>
                      <div className='flex items-center gap-4'>
                        <div className='bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full'>
                          <CircleHelp className='size-5' />
                        </div>
                        <span className='text-start font-semibold'>{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className='p-4 bg-transparent'>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              {t("contactText")}
            </p>
            <Button className='cursor-pointer' asChild>
              <a href="mailto:hola@odiseo.online">
                {t("contactBtn")}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export { FaqSection }
