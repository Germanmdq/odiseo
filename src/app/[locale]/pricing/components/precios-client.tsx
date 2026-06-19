"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Check, Sparkles, ArrowLeft } from "lucide-react"
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
            <button
              onClick={pagarConMP}
              disabled={mpEstado === "loading" || ppEstado === "loading"}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: "#E8401A" }}
            >
              {mpEstado === "loading" ? "Procesando..." : "Pagar con MercadoPago"}
            </button>

            <button
              onClick={pagarConPayPal}
              disabled={mpEstado === "loading" || ppEstado === "loading"}
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              style={{ backgroundColor: "#FFC439", color: "#003087" }}
            >
              {ppEstado === "loading" ? (
                "Procesando..."
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#003087">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 6.082-8.558 6.082H9.824l-1.42 9.02h3.77c.524 0 .968-.382 1.05-.9l.058-.303 1.013-6.428.065-.353c.082-.518.527-.9 1.05-.9h.663c4.296 0 7.662-1.747 8.647-6.797.41-2.104.203-3.86-.499-5.134z"/>
                  </svg>
                  PayPal
                </>
              )}
            </button>
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
            El plan anual incluye los 4 talleres actuales de Germán y Taty y 8 talleres nuevos próximos durante el año.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
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
