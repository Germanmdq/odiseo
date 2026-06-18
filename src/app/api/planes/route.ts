import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const body = await req.json()
  
  if (!body.deseo?.trim() || !body.nombre?.trim()) {
    return NextResponse.json({ error: "El deseo y el nombre son obligatorios" }, { status: 400 })
  }

  const admin = createAdminClient()
  
  const { data, error } = await admin
    .from("plan_solicitudes")
    .insert({
      user_id: user.id,
      deseo: body.deseo,
      nombre: body.nombre,
      edad: body.edad ? parseInt(body.edad) : null,
      pais_ciudad: body.paisCiudad || null,
      trabaja: body.trabaja ?? null,
      ocupacion: body.ocupacion || null,
      estado_civil: body.estadoCivil || null,
      tiene_hijos: body.tieneHijos ?? null,
      cantidad_hijos: body.cantidadHijos ? parseInt(body.cantidadHijos) : null,
      conoce_neville: body.conoceNeville || null,
      hora_despertar: body.horaDespertar || null,
      hora_dormir: body.horaDormir || null,
      duracion_dias: parseInt(body.duracionDias) || 30,
      mensaje_extra: body.mensajeExtra || null,
      status: "pendiente",
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Enviar email a Germán
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "germangonzalezmdq@gmail.com",
      subject: `Nueva solicitud de plan — ${body.nombre}`,
      html: `
        <h2>Nueva solicitud de plan personalizado</h2>
        
        <h3>Deseo</h3>
        <p>${body.deseo}</p>
        
        <h3>Datos personales</h3>
        <ul>
          <li><strong>Nombre:</strong> ${body.nombre}</li>
          <li><strong>Edad:</strong> ${body.edad || "—"}</li>
          <li><strong>País/Ciudad:</strong> ${body.paisCiudad || "—"}</li>
          <li><strong>Trabaja:</strong> ${body.trabaja === true ? `Sí — ${body.ocupacion || ""}` : body.trabaja === false ? "No" : "—"}</li>
          <li><strong>Estado civil:</strong> ${body.estadoCivil || "—"}</li>
          <li><strong>Hijos:</strong> ${body.tieneHijos ? `Sí — ${body.cantidadHijos || ""}` : "No"}</li>
          <li><strong>Conoce las enseñanzas:</strong> ${body.conoceNeville || "—"}</li>
        </ul>
        
        <h3>Práctica</h3>
        <ul>
          <li><strong>Se despierta:</strong> ${body.horaDespertar || "—"}</li>
          <li><strong>Se duerme:</strong> ${body.horaDormir || "—"}</li>
          <li><strong>Duración del plan:</strong> ${body.duracionDias} días</li>
        </ul>
        
        ${body.mensajeExtra ? `<h3>Mensaje extra</h3><p>${body.mensajeExtra}</p>` : ""}
        
        <hr>
        <p><a href="https://odiseo.online/es/admin/planes">Ir al panel de admin para responder →</a></p>
      `,
    })
  } catch (emailError) {
    // Graceful degradation — la solicitud se guardó igual
    console.error("Error enviando email:", emailError)
  }

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
