import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { activarSuscripcion } from "@/lib/acceso"
import MercadoPago, { Payment } from "mercadopago"

export const runtime = "nodejs"

// Comparación en tiempo constante de dos hashes hex (anti timing attacks).
function timingSafeEqualHex(a: string, b: string): boolean {
  let bufA: Buffer
  let bufB: Buffer
  try {
    bufA = Buffer.from(a, "hex")
    bufB = Buffer.from(b, "hex")
  } catch {
    return false
  }
  if (bufA.length === 0 || bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

/**
 * Valida la firma del webhook de MercadoPago.
 * Manifest oficial: `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`
 * HMAC-SHA256 con MP_WEBHOOK_SECRET, comparado contra el valor v1 de x-signature.
 */
function validarFirmaMP(req: NextRequest, dataIdBody?: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) {
    console.error("[mp-webhook] MP_WEBHOOK_SECRET no está configurado en el entorno")
    return false
  }

  const xSignature = req.headers.get("x-signature")
  const xRequestId = req.headers.get("x-request-id")
  if (!xSignature || !xRequestId) return false

  // x-signature: "ts=1700000000,v1=abc123..."
  let ts = ""
  let v1 = ""
  for (const part of xSignature.split(",")) {
    const idx = part.indexOf("=")
    if (idx === -1) continue
    const k = part.slice(0, idx).trim()
    const val = part.slice(idx + 1).trim()
    if (k === "ts") ts = val
    else if (k === "v1") v1 = val
  }
  if (!ts || !v1) return false

  // data.id: MP lo manda como query param en la URL de notificación.
  // Si es alfanumérico debe ir en minúsculas. Fallback al data.id del body.
  const queryDataId = req.nextUrl.searchParams.get("data.id") ?? dataIdBody ?? ""
  const dataId = queryDataId.toLowerCase()

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const computed = crypto.createHmac("sha256", secret).update(manifest).digest("hex")

  return timingSafeEqualHex(computed, v1)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const dataIdBody =
    body?.data?.id != null ? String(body.data.id) : undefined

  // Validación de origen ANTES de cualquier llamada a payment.get() o activación.
  if (!validarFirmaMP(req, dataIdBody)) {
    console.warn("[mp-webhook] firma inválida o headers faltantes — solicitud rechazada (401)")
    return NextResponse.json({ error: "invalid signature" }, { status: 401 })
  }

  if (!body || body.type !== "payment") return NextResponse.json({ ok: true })

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
