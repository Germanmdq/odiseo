import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const body = await req.json()
  const admin = createAdminClient()
  
  const { data, error } = await admin
    .from("plan_solicitudes")
    .insert({
      user_id: user.id,
      deseo: body.deseo,
      nombre: body.nombre,
      edad: body.edad ? parseInt(body.edad) : null,
      pais_ciudad: body.paisCiudad,
      trabaja: body.trabaja,
      ocupacion: body.ocupacion || null,
      estado_civil: body.estadoCivil,
      tiene_hijos: body.tieneHijos,
      cantidad_hijos: body.cantidadHijos ? parseInt(body.cantidadHijos) : null,
      conoce_neville: body.conoceNeville,
      hora_despertar: body.horaDespertar,
      hora_dormir: body.horaDormir,
      duracion_dias: parseInt(body.duracionDias) || 30,
      mensaje_extra: body.mensajeExtra || null,
      status: "pendiente",
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, id: data.id })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("plan_solicitudes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
