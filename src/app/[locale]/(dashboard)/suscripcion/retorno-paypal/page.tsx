"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function RetornoPayPalPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const token = searchParams.get("token") // PayPal passes the order ID as "token"
    const payerId = searchParams.get("PayerID")

    if (!token || !payerId) {
      router.replace("/es/suscripcion/pendiente")
      return
    }

    fetch("/api/pagos/paypal/capturar-orden", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: token }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = (await res.json()) as { error?: string }
          setError(data.error ?? "Error al capturar el pago")
          return
        }
        router.replace("/es/suscripcion/exito")
      })
      .catch(() => {
        setError("Error de red al capturar el pago")
      })
  }, [router, searchParams])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-4">
        <p className="text-destructive text-lg font-medium">{error}</p>
        <p className="text-muted-foreground">
          Si el monto fue debitado, contactanos y lo resolvemos.
        </p>
        <a href="/es/pricing" className="text-primary underline underline-offset-4">
          Volver a planes
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-muted-foreground">Confirmando tu pago con PayPal…</p>
    </div>
  )
}
