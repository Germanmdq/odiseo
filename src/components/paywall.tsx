"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

const PLANES = [
  {
    id: "semanal",
    nombre: "Semanal",
    precioUSD: "$5 USD",
    precioARS: "$7.000 ARS",
    badge: null,
    features: ["Coach ilimitado", "Creador de escenas", "Biblioteca completa"],
  },
  {
    id: "mensual",
    nombre: "Mensual",
    precioUSD: "$9 USD",
    precioARS: "$12.000 ARS",
    badge: "Más elegido",
    features: ["Coach ilimitado", "Creador de escenas", "Biblioteca completa", "Mi libro"],
  },
  {
    id: "anual",
    nombre: "Anual",
    precioUSD: "$47 USD",
    precioARS: "$55.000 ARS",
    badge: "Mejor precio — talleres incluidos",
    features: ["Todo lo anterior", "32 talleres grabados", "Germán y Taty Baldi", "Nuevas grabaciones"],
  },
]

interface PaywallProps {
  locale?: string
}

export function Paywall({ locale = "es" }: PaywallProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center gap-8">
      <div className="max-w-lg space-y-3">
        <h2 className="text-2xl font-bold">Ya sentiste lo que es Odiseo</h2>
        <p className="text-muted-foreground">
          Tu primera sesión fue gratuita. Para seguir usando el Coach, el
          Creador de escenas y toda la biblioteca sin límites, elegí tu plan:
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 w-full max-w-3xl">
        {PLANES.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-xl border bg-card p-5 text-left shadow-sm gap-4 ${
              plan.id === "mensual" ? "border-primary ring-1 ring-primary" : ""
            }`}
          >
            {plan.badge && (
              <Badge
                className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs"
                variant={plan.id === "mensual" ? "default" : "secondary"}
              >
                {plan.badge}
              </Badge>
            )}
            <div>
              <p className="font-semibold text-base">{plan.nombre}</p>
              <p className="text-2xl font-bold mt-1">{plan.precioUSD}</p>
              <p className="text-xs text-muted-foreground">{plan.precioARS}</p>
            </div>
            <ul className="space-y-1.5 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              asChild
              variant={plan.id === "mensual" ? "default" : "outline"}
              className="w-full cursor-pointer"
            >
              <Link href={`/${locale}/pricing`}>Elegir {plan.nombre.toLowerCase()}</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
