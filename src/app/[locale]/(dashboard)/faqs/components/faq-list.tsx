"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

interface FAQ {
  id: number
  question: string
  answer: string
  category: string
}

interface Category {
  name: string
  count: number
}

interface FAQListProps {
  faqs: FAQ[]
  categories: Category[]
}

export function FAQList({ faqs, categories }: FAQListProps) {
  const [selectedCategory, setSelectedCategory] = useState("Todas")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      selectedCategory === "Todas" || faq.category === selectedCategory
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-6 xl:grid-cols-4">
      {/* Categories Sidebar */}
      <Card className="lg:col-span-2 xl:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Categorías</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar preguntas..."
              className="cursor-pointer pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.name}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-muted",
                selectedCategory === category.name && "bg-muted"
              )}
              onClick={() => setSelectedCategory(category.name)}
            >
              <span className="font-medium">{category.name}</span>
              <Badge
                variant="secondary"
                className={cn(
                  "transition-colors",
                  selectedCategory === category.name && "bg-background"
                )}
              >
                {category.name === "Todas" ? faqs.length : category.count}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* FAQs List */}
      <div className="lg:col-span-4 xl:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedCategory === "Todas"
                ? "Todas las preguntas"
                : `${selectedCategory}`}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filteredFaqs.length}{" "}
                {filteredFaqs.length === 1 ? "pregunta" : "preguntas"})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-auto md:h-[570px] md:pr-4">
              {filteredFaqs.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p>No se encontraron preguntas.</p>
                </div>
              ) : (
                <Accordion type="single" className="space-y-4" defaultValue="item-1">
                  {filteredFaqs.map((item) => (
                    <AccordionItem
                      key={item.id}
                      value={`item-${item.id}`}
                      className="rounded-2xl !border border-black/10 bg-card shadow-[0_8px_28px_rgba(0,0,0,0.08)]"
                    >
                      <AccordionTrigger className="cursor-pointer px-4 hover:no-underline">
                        <div className="flex min-w-0 flex-col items-start gap-2 text-left sm:flex-row">
                          <span>{item.question}</span>
                          <Badge
                            variant="outline"
                            className="shrink-0 text-xs sm:ms-3 sm:mt-0.5"
                          >
                            {item.category}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
