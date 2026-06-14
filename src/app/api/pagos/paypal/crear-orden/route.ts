import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PLANES, isPlanId } from "@/lib/planes"

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

  if (!res.ok) throw new Error(`PayPal token error: ${res.status}`)
  const data = (await res.json()) as { access_token: string }
  return data.access_token
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const body = (await request.json()) as { planId?: string }
  const planId = body.planId

  if (!planId || !isPlanId(planId)) {
    return NextResponse.json({ error: "planId inválido" }, { status: 400 })
  }

  const plan = PLANES[planId]
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"

  let token: string
  try {
    token = await getPayPalToken()
  } catch (err) {
    console.error("PayPal token error:", err)
    return NextResponse.json({ error: "PayPal no configurado" }, { status: 500 })
  }

  const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: planId,
          custom_id: `${user.id}:${planId}`,
          description: `Odiseo — Plan ${plan.nombre}`,
          amount: {
            currency_code: "USD",
            value: String(plan.precio_usd.toFixed(2)),
          },
        },
      ],
      application_context: {
        brand_name: "Odiseo",
        locale: "es-AR",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        return_url: `${baseUrl}/es/suscripcion/retorno-paypal`,
        cancel_url: `${baseUrl}/es/suscripcion/pendiente`,
      },
    }),
  })

  if (!orderRes.ok) {
    const err = await orderRes.text()
    console.error("PayPal create order error:", err)
    return NextResponse.json({ error: "Error al crear orden PayPal" }, { status: 502 })
  }

  const order = (await orderRes.json()) as {
    id: string
    links: Array<{ rel: string; href: string }>
  }

  const approveLink = order.links.find((l) => l.rel === "approve")?.href

  return NextResponse.json({ orderId: order.id, approveUrl: approveLink })
}
