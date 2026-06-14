import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PLANES, isPlanId } from "@/lib/planes"

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

  const accessToken = process.env.MP_ACCESS_TOKEN
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"

  if (!accessToken) {
    return NextResponse.json({ error: "MP no configurado" }, { status: 500 })
  }

  const plan = PLANES[planId]

  const preference = {
    items: [
      {
        id: planId,
        title: `Odiseo — Plan ${plan.nombre}`,
        description: plan.descripcion,
        quantity: 1,
        currency_id: "ARS",
        unit_price: plan.precio_ars,
      },
    ],
    back_urls: {
      success: `${baseUrl}/es/suscripcion/exito`,
      failure: `${baseUrl}/es/suscripcion/pendiente`,
      pending: `${baseUrl}/es/suscripcion/pendiente`,
    },
    auto_return: "approved",
    notification_url: `${baseUrl}/api/pagos/mp/webhook`,
    metadata: {
      userId: user.id,
      planId,
    },
  }

  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(preference),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error("MP preference error:", err)
    return NextResponse.json({ error: "Error al crear preferencia MP" }, { status: 502 })
  }

  const data = (await res.json()) as { init_point: string; sandbox_init_point: string }
  return NextResponse.json({ init_point: data.init_point })
}
