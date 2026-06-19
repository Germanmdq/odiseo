import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { escapeHtml, sendOdiseoEmail, siteUrl } from "@/lib/email"

interface Solicitud {
  id: string
  user_id: string
  nombre: string
  deseo: string
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user?.email !== "germangonzalezmdq@gmail.com") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { respuesta } = (await req.json()) as { respuesta: string }
  if (!respuesta?.trim()) {
    return NextResponse.json({ error: "La respuesta no puede estar vacía" }, { status: 400 })
  }

  const admin = createAdminClient()

  // Obtener la solicitud para saber el email del usuario
  const { data: solicitudData } = await admin
    .from("plan_solicitudes")
    .select("id, user_id, nombre, deseo")
    .eq("id", id)
    .single()

  const solicitud = solicitudData as Solicitud | null

  const { error } = await admin
    .from("plan_solicitudes")
    .update({
      respuesta,
      status: "respondido",
      respondido_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (solicitud) {
    const { error: mensajeError } = await admin
      .from("mensajes")
      .insert({
        user_id: solicitud.user_id,
        remitente: "german",
        contenido: respuesta.trim(),
        plan_solicitud_id: id,
      })

    if (mensajeError) {
      console.error("Error creando mensaje del plan:", mensajeError)
    }
  }

  // Obtener email del usuario para notificarle
  let emailSent = false
  if (solicitud) {
    try {
      const { data: userData } = await admin.auth.admin.getUserById(solicitud.user_id)
      if (userData?.user?.email) {
        const emailResult = await sendOdiseoEmail({
          to: userData.user.email,
          subject: "Tu plan personalizado está listo",
          html: `
            <h2>Hola ${escapeHtml(solicitud.nombre)},</h2>
            <p>Germán preparó tu plan personalizado. Podés verlo en Odiseo en la sección Mensajes.</p>
            <p><a href="${siteUrl}/es/mensajes">Ver mi plan →</a></p>
          `,
        })
        emailSent = emailResult.sent
      }
    } catch (e) {
      console.error("Error enviando email al usuario:", e)
    }
  }

  return NextResponse.json({ ok: true, emailSent })
}
