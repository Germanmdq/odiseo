"use client"

import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface UsageHintProps {
  usosRestantes: number
  locale?: string
  className?: string
}

export function UsageHint({ usosRestantes, locale = "es", className }: UsageHintProps) {
  if (usosRestantes <= 0 || usosRestantes > 3) return null

  const esUltimo = usosRestantes === 1

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border px-4 py-3 text-sm",
        esUltimo
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-yellow-400/30 bg-yellow-50/50 text-yellow-800 dark:text-yellow-400",
        className
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        {esUltimo
          ? "Este es tu último uso gratuito. "
          : `Te quedan ${usosRestantes} usos gratuitos. `}
        <Link
          href={`/${locale}/pricing`}
          className="underline underline-offset-4 font-medium"
        >
          Suscribite para usar sin límites.
        </Link>
      </span>
    </div>
  )
}
