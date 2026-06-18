import Link from "next/link"
import { Clock } from "lucide-react"

export default async function SuscripcionPendientePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center space-y-6 bg-background">
      <div 
        className="size-20 rounded-full flex items-center justify-center text-white animate-pulse"
        style={{ backgroundColor: "#E8401A" }}
      >
        <Clock className="size-10" />
      </div>
      <h1 className="text-3xl font-semibold text-foreground">Pago Pendiente</h1>
      <p className="text-muted-foreground max-w-sm">
        Tu pago se está procesando. Una vez acreditado, tu suscripción se activará automáticamente y podrás acceder a todo el contenido.
      </p>
      <Link
        href={`/${locale}/`}
        className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 cursor-pointer"
        style={{ backgroundColor: "#E8401A" }}
      >
        Volver al Inicio
      </Link>
    </div>
  )
}
