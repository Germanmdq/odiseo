import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default async function SuscripcionExitoPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ plan?: string; gateway?: string }>
}) {
  const { locale } = await params
  const { plan } = await searchParams

  const PLAN_LABELS: Record<string, string> = {
    semanal: "Plan Semanal",
    mensual: "Plan Mensual",
    anual: "Plan Anual — Talleres incluidos",
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center space-y-6">
      <div className="size-20 rounded-full flex items-center justify-center text-white animate-bounce"
        style={{ backgroundColor: "#E8401A" }}>
        <CheckCircle className="size-10" />
      </div>
      <h1 className="text-3xl font-semibold text-foreground">¡Bienvenido a Odiseo!</h1>
      <p className="text-muted-foreground max-w-sm">
        Tu {PLAN_LABELS[plan ?? ""] ?? "suscripción"} está activa. 
        Ya podés usar todas las herramientas sin límites.
      </p>
      <Link
        href={`/${locale}/coach`}
        className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 cursor-pointer"
        style={{ backgroundColor: "#E8401A" }}
      >
        Ir al Coach →
      </Link>
    </div>
  )
}
