import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SuscripcionExitoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6">
      <div className="rounded-full bg-green-100 p-4">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">¡Tu suscripción está activa!</h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Ya podés usar todo Odiseo. Bienvenido a la práctica completa de las enseñanzas de Neville Goddard.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild size="lg">
          <Link href="/es/coach">Ir al Coach</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/es/dashboard">Ir al inicio</Link>
        </Button>
      </div>
    </div>
  )
}
