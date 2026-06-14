import { createHmac } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { isPlanId } from "@/lib/planes"
import { activarSuscripcion } from "@/lib/suscripcion"

export const runtime = "nodejs"

function verifySignature(request: NextRequest, rawBody: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return false

  const xSignature = request.headers.get("x-signature") ?? ""
  const xRequestId = request.headers.get("x-request-id") ?? ""

  // Parse ts and v1 from x-signature: "ts=...v1=..."
  const parts = Object.fromEntries(
    xSignature.split(",").map((p) => {
      const [k, v] = p.trim().split("=")
      return [k, v]
    })
  )
  const ts = parts["ts"]
  const v1 = parts["v1"]

  if (!ts || !v1) return false

  // Get the data.id from the query param (MP sends it as ?data.id=...)
  const url = new URL(request.url)
  const dataId = url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? ""

  const template = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const expectedHash = createHmac("sha256", secret).update(template).digest("hex")

  return expectedHash === v1
}

type MPPayment = {
  status?: string
  metadata?: {
    userId?: string
    planId?: string
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  // Always return 200 — MP retries if it doesn't get 200
  if (!verifySignature(request, rawBody)) {
    console.warn("MP webhook: invalid signature")
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  let body: { type?: string; data?: { id?: string } }
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  if (body.type !== "payment" || !body.data?.id) {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  const paymentId = body.data.id
  const accessToken = process.env.MP_ACCESS_TOKEN

  if (!accessToken) {
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  // Fetch payment details from MP (don't trust webhook body alone)
  const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!paymentRes.ok) {
    console.error("MP: failed to fetch payment", paymentId)
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  const payment = (await paymentRes.json()) as MPPayment

  if (payment.status !== "approved") {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  const { userId, planId } = payment.metadata ?? {}

  if (!userId || !planId || !isPlanId(planId)) {
    console.error("MP webhook: missing or invalid userId/planId in metadata", payment.metadata)
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  try {
    await activarSuscripcion(userId, planId, "mercadopago", String(paymentId))
  } catch (err) {
    console.error("MP webhook: activarSuscripcion failed", err)
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
