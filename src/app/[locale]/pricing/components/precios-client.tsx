"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Check, Sparkles, Loader2, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { PLANES, type PlanId } from "@/lib/planes"

const PLAN_ORDER: PlanId[] = ["semanal", "mensual", "anual"]

type PagoEstado = "idle" | "loading" | "error"

interface PreciosClientProps {
  locale: string
  userId: string | null
}

function PlanCard({
  planId,
  userId,
  planActual,
  locale,
}: {
  planId: PlanId
  userId: string | null
  planActual: string | null
  locale: string
}) {
  const router = useRouter()
  const plan = PLANES[planId]
  const badge = plan.badge
  const esActual = planActual === planId
  const esMasElegido = plan.destacado

  const [mpEstado, setMpEstado] = React.useState<PagoEstado>("idle")
  const [ppEstado, setPpEstado] = React.useState<PagoEstado>("idle")

  async function pagarConMP() {
    if (!userId) {
      router.push(`/${locale}/auth/login`)
      return
    }
    setMpEstado("loading")
    try {
      const res = await fetch("/api/pagos/mp/crear-preferencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      })
      const data = (await res.json()) as { init_point?: string; error?: string }
      if (!res.ok || !data.init_point) {
        setMpEstado("error")
        return
      }
      window.location.href = data.init_point
    } catch {
      setMpEstado("error")
    }
  }

  async function pagarConPayPal() {
    if (!userId) {
      router.push(`/${locale}/auth/login`)
      return
    }
    setPpEstado("loading")
    try {
      const res = await fetch("/api/pagos/paypal/crear-orden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      })
      const data = (await res.json()) as { approveUrl?: string; error?: string }
      if (!res.ok || !data.approveUrl) {
        setPpEstado("error")
        return
      }
      window.location.href = data.approveUrl
    } catch {
      setPpEstado("error")
    }
  }

  return (
    <Card
      className={cn("relative flex flex-col pt-0 bg-card", {
        "border-[#E8401A] shadow-lg": esMasElegido,
        "border-[#E8401A]": esActual,
        "border-border": !esMasElegido && !esActual,
      })}
    >
      {badge && !esActual && (
        <div className="absolute start-0 -top-3 w-full">
          <Badge
            className="mx-auto flex w-fit gap-1.5 rounded-full font-medium border-transparent text-white"
            style={{ backgroundColor: "#E8401A" }}
          >
            {esMasElegido && <Sparkles className="!size-4" />}
            {badge}
          </Badge>
        </div>
      )}
      {esActual && (
        <div className="absolute start-0 -top-3 w-full">
          <Badge
            variant="outline"
            className="mx-auto flex w-fit gap-1.5 rounded-full border-[#E8401A] bg-[#E8401A]/10 text-[#E8401A] font-medium"
          >
            Plan activo
          </Badge>
        </div>
      )}

      <CardHeader className="pt-8 text-center space-y-2">
        <CardTitle className="text-2xl">{plan.nombre}</CardTitle>
        <p className="text-sm text-muted-foreground text-balance">{plan.descripcion}</p>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col space-y-6">
        <div className="text-center">
          <span className="text-4xl font-bold">{plan.precioUSD}</span>
          <span className="text-muted-foreground text-sm">{plan.periodo}</span>
          <p className="text-xs text-muted-foreground mt-1">{plan.precioARS} ARS</p>
        </div>

        <div className="space-y-2">
          {plan.features.map((feature) => (
            <div key={feature} className="flex items-start gap-2">
              <div className="bg-muted mt-0.5 rounded-full p-1 shrink-0">
                <Check className="size-3" />
              </div>
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        {esActual ? (
          <Button className="w-full cursor-not-allowed" variant="outline" disabled>
            Plan activo
          </Button>
        ) : (
          <>
            <Button
              className="w-full text-white hover:opacity-90 transition-opacity border-transparent cursor-pointer"
              size="lg"
              style={{ backgroundColor: "#009EE3" }}
              onClick={pagarConMP}
              disabled={mpEstado === "loading" || ppEstado === "loading"}
            >
              {mpEstado === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mpEstado === "error" ? "Error — intentá de nuevo" : "Pagar con MercadoPago"}
            </Button>

            <Button
              className="w-full font-medium border-2 border-foreground/20 hover:border-foreground/40 cursor-pointer"
              variant="outline"
              size="lg"
              onClick={pagarConPayPal}
              disabled={mpEstado === "loading" || ppEstado === "loading"}
            >
              {ppEstado === "loading" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Pagar con PayPal"
              )}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

export function PreciosClient({ locale, userId }: PreciosClientProps) {
  const [planActual, setPlanActual] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!userId) return

    fetch("/api/suscripcion/estado")
      .then((r) => r.json())
      .then((d: { suscripto?: boolean; plan?: string }) => {
        if (d.suscripto && d.plan) setPlanActual(d.plan)
      })
      .catch(() => {})
  }, [userId])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b flex justify-between items-center max-w-7xl mx-auto w-full">
        <Link href={`/${locale}`} className="flex items-center gap-2.5">
          <Image
            src="/logo-odiseo.png"
            alt="Odiseo"
            width={36}
            height={36}
            className="rounded-full"
          />
          <span className="font-bold tracking-wide text-lg text-foreground">Odiseo</span>
        </Link>
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Volver al Dashboard
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 max-w-6xl mx-auto w-full space-y-8">
        <div className="text-center max-w-lg space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Planes Odiseo
          </h1>
          <p className="text-muted-foreground text-sm">
            Elegí el plan que mejor se adapta a vos. Cancelás cuando querés. 
            El plan anual te da acceso exclusivo a los talleres de Germán y Taty.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 w-full">
          {PLAN_ORDER.map((planId) => (
            <PlanCard
              key={planId}
              planId={planId}
              userId={userId}
              planActual={planActual}
              locale={locale}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t text-center text-xs text-muted-foreground w-full">
        <p className="text-center text-xs text-muted-foreground mt-4 mb-2">
          Podés cancelar en cualquier momento desde tu perfil.
        </p>
        <p>
          © {new Date().getFullYear()} Odiseo. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  )
}
