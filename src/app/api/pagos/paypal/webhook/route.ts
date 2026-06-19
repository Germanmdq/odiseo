import { NextRequest, NextResponse } from "next/server"
import { isPlanId } from "@/lib/planes"
import { activarSuscripcion } from "@/lib/suscripcion"

export const runtime = "nodejs"

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
  const data = (await res.json()) as { access_token: string }
  return data.access_token
}

async function verifyWebhook(
  request: NextRequest,
  rawBody: string
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) return false

  let token: string
  try {
    token = await getPayPalToken()
  } catch {
    return false
  }

  const verifyRes = await fetch(`${PAYPAL_API}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: request.headers.get("paypal-auth-algo") ?? "",
      cert_url: request.headers.get("paypal-cert-url") ?? "",
      transmission_id: request.headers.get("paypal-transmission-id") ?? "",
      transmission_sig: request.headers.get("paypal-transmission-sig") ?? "",
      transmission_time: request.headers.get("paypal-transmission-time") ?? "",
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
  })

  if (!verifyRes.ok) return false
  const result = (await verifyRes.json()) as { verification_status: string }
  return result.verification_status === "SUCCESS"
}

type PayPalCaptureEvent = {
  event_type?: string
  resource?: {
    id?: string
    purchase_units?: Array<{ custom_id?: string }>
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  const valid = await verifyWebhook(request, rawBody)
  if (!valid) {
    console.warn("PayPal webhook: invalid signature")
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  let event: PayPalCaptureEvent
  try {
    event = JSON.parse(rawBody) as PayPalCaptureEvent
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  if (event.event_type !== "PAYMENT.CAPTURE.COMPLETED") {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  const orderId = event.resource?.id ?? ""
  const customId = event.resource?.purchase_units?.[0]?.custom_id ?? ""
  const [userId, planId] = customId.split(/[|:]/)

  if (!userId || !planId || !isPlanId(planId)) {
    console.error("PayPal webhook: invalid custom_id", customId)
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  try {
    await activarSuscripcion(userId, planId, "paypal", orderId)
  } catch (err) {
    console.error("PayPal webhook: activarSuscripcion failed", err)
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
