"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Check, Sparkles, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { PLANES, type PlanId } from "@/lib/planes"

const PLAN_ORDER: PlanId[] = ["semanal", "mensual", "anual"]

type PagoEstado = "idle" | "loading" | "error"

function PlanCard({
  planId,
  userId,
  planActual,
}: {
  planId: PlanId
  userId: string | null
  planActual: string | null
}) {
  const router = useRouter()
  const plan = PLANES[planId]
  const badge = "badge" in plan ? (plan.badge as string) : null
  const esActual = planActual === planId
  const esMasElegido = planId === "mensual"

  const [mpEstado, setMpEstado] = React.useState<PagoEstado>("idle")
  const [ppEstado, setPpEstado] = React.useState<PagoEstado>("idle")

  async function pagarConMP() {
    if (!userId) {
      router.push("/sign-in")
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
      router.push("/sign-in")
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
      className={cn("relative flex flex-col pt-0", {
        "border-[#E8401A] shadow-lg": esMasElegido,
        "border-[#E8401A]": esActual,
      })}
    >
      {esMasElegido && !esActual && (
        <div className="absolute start-0 -top-3 w-full">
          <Badge className="mx-auto flex w-fit gap-1.5 rounded-full font-medium border-transparent text-white" style={{ backgroundColor: "#E8401A" }}>
            <Sparkles className="!size-4" />
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
      {!esMasElegido && badge && !esActual && (
        <div className="absolute start-0 -top-3 w-full">
          <Badge variant="secondary" className="mx-auto flex w-fit rounded-full font-medium text-xs">
            {badge}
          </Badge>
        </div>
      )}

      <CardHeader className="pt-8 text-center space-y-2">
        <CardTitle className="text-2xl">{plan.nombre}</CardTitle>
        <p className="text-sm text-muted-foreground text-balance">{plan.descripcion}</p>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col space-y-6">
        <div className="text-center">
          <span className="text-4xl font-bold">${plan.precio_usd}</span>
          <span className="text-muted-foreground text-sm">
            {plan.periodo === "weekly"
              ? " / semana"
              : plan.periodo === "monthly"
                ? " / mes"
                : " / año"}
          </span>
          <p className="text-xs text-muted-foreground mt-1">
            ${plan.precio_ars.toLocaleString("es-AR")} ARS
          </p>
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
          <Button className="w-full" variant="outline" disabled>
            Plan activo
          </Button>
        ) : (
          <>
            <Button
              className="w-full text-white hover:opacity-90 transition-opacity border-transparent"
              size="lg"
              style={{ backgroundColor: "#009EE3" }}
              onClick={pagarConMP}
              disabled={mpEstado === "loading" || ppEstado === "loading"}
            >
              {mpEstado === "loading" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {mpEstado === "error"
                ? "Error — intentá de nuevo"
                : "Pagar con MercadoPago"}
            </Button>

            <Button
              className="w-full bg-[#003087] hover:bg-[#003087]/90 text-white"
              size="lg"
              onClick={pagarConPayPal}
              disabled={mpEstado === "loading" || ppEstado === "loading"}
            >
              {ppEstado === "loading" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {ppEstado === "error" ? "Error — intentá de nuevo" : "Pagar con PayPal"}
            </Button>

            {!userId && (
              <p className="text-xs text-center text-muted-foreground">
                Necesitás estar logueado para suscribirte.
              </p>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  )
}

export function PreciosOdiseo() {
  const [userId, setUserId] = React.useState<string | null>(null)
  const [planActual, setPlanActual] = React.useState<string | null>(null)

  React.useEffect(() => {
    // Get current user
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null)
    })

    // Get subscription status
    fetch("/api/suscripcion/estado")
      .then((r) => r.json())
      .then((d: { suscripto?: boolean; plan?: string }) => {
        if (d.suscripto && d.plan) setPlanActual(d.plan)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {PLAN_ORDER.map((planId) => (
        <PlanCard
          key={planId}
          planId={planId}
          userId={userId}
          planActual={planActual}
        />
      ))}
    </div>
  )
}
