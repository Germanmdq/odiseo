import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const PLANES_PAYPAL = {
  semanal: { price: "5.00",  description: "Odiseo — Plan Semanal" },
  mensual: { price: "9.00",  description: "Odiseo — Plan Mensual" },
  anual:   { price: "47.00", description: "Odiseo — Plan Anual" },
}

async function getPaypalToken() {
  const res = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  })
  const data = await res.json()
  return data.access_token as string
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { plan } = await req.json() as { plan: keyof typeof PLANES_PAYPAL }
  if (!PLANES_PAYPAL[plan]) return NextResponse.json({ error: "Plan inválido" }, { status: 400 })

  const token = await getPaypalToken()
  
  const res = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        description: PLANES_PAYPAL[plan].description,
        custom_id: `${user.id}|${plan}|paypal`,
        amount: { currency_code: "USD", value: PLANES_PAYPAL[plan].price },
      }],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_URL}/api/pagos/paypal/capturar`,
        cancel_url: `${process.env.NEXT_PUBLIC_URL}/es/precios?error=pago_cancelado`,
      },
    }),
  })

  const order = await res.json()
  const approveUrl = order.links?.find((l: { rel: string }) => l.rel === "approve")?.href
  return NextResponse.json({ approveUrl, orderId: order.id })
}
