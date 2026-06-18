import { NextRequest, NextResponse } from "next/server"
import { activarSuscripcion } from "@/lib/acceso"
import { redirect } from "next/navigation"

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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get("token")
  if (!orderId) redirect("/es/precios?error=pago_fallido")

  const token = await getPaypalToken()
  
  const res = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json()
  if (data.status !== "COMPLETED") redirect("/es/precios?error=pago_fallido")

  const customId = data.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id ?? ""
  const [userId, plan] = customId.split("|")
  const amount = parseFloat(data.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ?? "0")

  await activarSuscripcion({
    userId,
    plan,
    gateway: "paypal",
    externalId: orderId,
    amount,
    currency: "USD",
  })

  redirect(`/es/suscripcion/exito?plan=${plan}&gateway=paypal`)
}
