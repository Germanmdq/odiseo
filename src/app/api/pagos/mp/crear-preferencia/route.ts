import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import MercadoPago, { Preference } from "mercadopago"

const PLANES_MP = {
  semanal:  { title: "Odiseo — Plan Semanal",  price: 7000,  currency: "ARS" },
  mensual:  { title: "Odiseo — Plan Mensual",  price: 12000, currency: "ARS" },
  anual:    { title: "Odiseo — Plan Anual",    price: 55000, currency: "ARS" },
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { plan } = await req.json() as { plan: keyof typeof PLANES_MP }
  if (!PLANES_MP[plan]) return NextResponse.json({ error: "Plan inválido" }, { status: 400 })

  const client = new MercadoPago({ accessToken: process.env.MP_ACCESS_TOKEN! })
  const preference = new Preference(client)

  const result = await preference.create({
    body: {
      items: [{
        id: plan,
        title: PLANES_MP[plan].title,
        quantity: 1,
        unit_price: PLANES_MP[plan].price,
        currency_id: "ARS",
      }],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_URL}/es/suscripcion/exito?plan=${plan}&gateway=mercadopago`,
        failure: `${process.env.NEXT_PUBLIC_URL}/es/pricing?error=pago_fallido`,
        pending: `${process.env.NEXT_PUBLIC_URL}/es/suscripcion/pendiente`,
      },
      auto_return: "approved",
      external_reference: `${user.id}|${plan}|mercadopago`,
      notification_url: `${process.env.NEXT_PUBLIC_URL}/api/pagos/mp/webhook`,
    }
  })

  return NextResponse.json({ init_point: result.init_point })
}
