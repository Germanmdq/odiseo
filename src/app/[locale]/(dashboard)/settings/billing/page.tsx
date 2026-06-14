"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2 } from "lucide-react"
import { PLANES, type PlanId } from "@/lib/planes"

type EstadoSuscripcion = {
  suscripto: boolean
  plan: string | null
  currentPeriodEnd: string | null
  pasarela: string | null
  incluye_talleres: boolean | null
}

function formatFecha(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function PasarelaLabel({ pasarela }: { pasarela: string | null }) {
  if (!pasarela) return null
  if (pasarela === "mercadopago") return <span>MercadoPago</span>
  if (pasarela === "paypal") return <span>PayPal</span>
  return <span>{pasarela}</span>
}

export default function SuscripcionPage() {
  const [estado, setEstado] = React.useState<EstadoSuscripcion | null>(null)
  const [cargando, setCargando] = React.useState(true)

  React.useEffect(() => {
    fetch("/api/suscripcion/estado")
      .then((r) => r.json())
      .then((d: EstadoSuscripcion) => setEstado(d))
      .catch(() => setEstado({ suscripto: false, plan: null, currentPeriodEnd: null, pasarela: null, incluye_talleres: null }))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[20vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const planId = estado?.plan as PlanId | null
  const planData = planId && planId in PLANES ? PLANES[planId] : null

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold">Suscripción</h1>
        <p className="text-muted-foreground">Administrá tu plan de Odiseo.</p>
      </div>

      {estado?.suscripto && planData ? (
        <>
          <Card className="border-green-500/50 bg-green-50/30">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle>Plan activo</CardTitle>
                <Badge className="bg-green-600 hover:bg-green-600">{planData.nombre}</Badge>
              </div>
              <CardDescription>{planData.descripcion}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Renovación</p>
                  <p className="font-medium">{formatFecha(estado.currentPeriodEnd)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pasarela</p>
                  <p className="font-medium">
                    <PasarelaLabel pasarela={estado.pasarela} />
                  </p>
                </div>
              </div>
              <div className="pt-2 space-y-1">
                {planData.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-green-600" />
                    {f}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cambiar plan</CardTitle>
              <CardDescription>
                Podés actualizar tu suscripción en cualquier momento.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/es/pricing">Ver todos los planes</Link>
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle>Sin suscripción activa</CardTitle>
              <Badge variant="outline">Sin plan</Badge>
            </div>
            <CardDescription>
              Tus usos gratuitos se agotaron o no tenés un plan activo. Suscribite para acceder a todas las funciones de Odiseo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {[
                "Coach IA con todos los maestros",
                "Creador de escenas ilimitado",
                "Biblioteca de fuentes completa",
                "Memoria personal",
                "Evaluaciones de conocimientos",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild>
              <Link href="/es/pricing">Ver planes</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
