import { NextRequest, NextResponse } from "next/server"
import { isPlanId } from "@/lib/planes"
import { activarSuscripcion } from "@/lib/suscripcion"

const PAYPAL_API = "https://api.paypal.com"

async function getPayPalToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error("PayPal credentials not configured")

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  if (!res.ok) throw new Error("PayPal token error")
  const data = (await res.json()) as { access_token: string }
  return data.access_token
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { orderId?: string }
  const { orderId } = body

  if (!orderId) return NextResponse.json({ error: "orderId requerido" }, { status: 400 })

  let token: string
  try {
    token = await getPayPalToken()
  } catch {
    return NextResponse.json({ error: "PayPal no configurado" }, { status: 500 })
  }

  // Capture the order
  const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })

  if (!captureRes.ok) {
    const err = await captureRes.text()
    console.error("PayPal capture error:", err)
    return NextResponse.json({ error: "Error al capturar el pago PayPal" }, { status: 502 })
  }

  const capture = (await captureRes.json()) as {
    status: string
    purchase_units?: Array<{ custom_id?: string }>
  }

  if (capture.status !== "COMPLETED") {
    return NextResponse.json({ error: "Pago no completado", status: capture.status }, { status: 402 })
  }

  // Extract userId:planId from custom_id
  const customId = capture.purchase_units?.[0]?.custom_id ?? ""
  const [userId, planId] = customId.split(/[|:]/)

  if (!userId || !planId || !isPlanId(planId)) {
    console.error("PayPal capture: invalid custom_id", customId)
    return NextResponse.json({ error: "custom_id inválido" }, { status: 400 })
  }

  try {
    await activarSuscripcion(userId, planId, "paypal", orderId)
  } catch (err) {
    console.error("PayPal: activarSuscripcion failed", err)
    return NextResponse.json({ error: "Error al activar suscripción" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
