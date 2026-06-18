import Link from "next/link"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SuscripcionPendientePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6">
      <div className="rounded-full bg-orange-100 dark:bg-orange-950/20 p-4">
        <Clock className="h-12 w-12 text-[#E8401A]" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Tu pago está siendo procesado</h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Esto puede demorar unos minutos. Cuando se confirme el pago te avisamos y tu suscripción se activa automáticamente.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild size="lg">
          <Link href="/es/pricing">Ver planes</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/es/dashboard">Ir al inicio</Link>
        </Button>
      </div>
    </div>
  )
}
