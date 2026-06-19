import "server-only"

import { type PlanId } from "@/lib/planes"
import { activarSuscripcion as activarAccesoSuscripcion } from "@/lib/acceso"

export async function activarSuscripcion(
  userId: string,
  planId: PlanId,
  pasarela: "mercadopago" | "paypal",
  pasarelaId: string
) {
  await activarAccesoSuscripcion({
    userId,
    plan: planId,
    gateway: pasarela,
    externalId: pasarelaId,
    amount: 0,
    currency: pasarela === "paypal" ? "USD" : "ARS",
  })
}
