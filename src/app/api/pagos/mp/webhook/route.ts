import { NextRequest, NextResponse } from "next/server"
import { activarSuscripcion } from "@/lib/acceso"
import MercadoPago, { Payment } from "mercadopago"

export async function POST(req: NextRequest) {
  const body = await req.json()
  
  if (body.type !== "payment") return NextResponse.json({ ok: true })

  const client = new MercadoPago({ accessToken: process.env.MP_ACCESS_TOKEN! })
  const payment = new Payment(client)
  const data = await payment.get({ id: body.data?.id })

  if (data.status !== "approved") return NextResponse.json({ ok: true })

  const [userId, plan] = (data.external_reference ?? "").split("|")
  if (!userId || !plan) return NextResponse.json({ ok: true })

  await activarSuscripcion({
    userId,
    plan,
    gateway: "mercadopago",
    externalId: String(data.id),
    amount: data.transaction_amount ?? 0,
    currency: "ARS",
  })

  return NextResponse.json({ ok: true })
}
