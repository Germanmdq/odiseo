"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface PaywallProps {
  locale?: string
}

export function Paywall({ locale = "es" }: PaywallProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-6">
      <div className="max-w-md space-y-3">
        <h2 className="text-2xl font-bold">Ya sentiste lo que es Odiseo</h2>
        <p className="text-muted-foreground">
          Para seguir con el Coach, el Creador de escenas y acceder a toda la
          biblioteca sin límites, elegí tu plan:
        </p>
      </div>
      <Button size="lg" asChild className="cursor-pointer">
        <Link href={`/${locale}/pricing`}>Ver planes</Link>
      </Button>
    </div>
  )
}
