import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { adminEmail, escapeHtml, sendOdiseoEmail, siteUrl } from "@/lib/email"

interface Solicitud {
  id: string
  user_id: string
  nombre: string
  deseo: string
  status: string
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: solicitudData, error: solicitudError } = await admin
    .from("plan_solicitudes")
    .select("id, user_id, nombre, deseo, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (solicitudError || !solicitudData) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
  }

  const solicitud = solicitudData as Solicitud

  if (solicitud.status !== "respondido" && solicitud.status !== "aprobado") {
    return NextResponse.json({ error: "El plan todavía no está listo para aprobar" }, { status: 400 })
  }

  if (solicitud.status !== "aprobado") {
    const { error: updateError } = await admin
      .from("plan_solicitudes")
      .update({ status: "aprobado" })
      .eq("id", id)
      .eq("user_id", user.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    const { error: mensajeError } = await admin
      .from("mensajes")
      .insert({
        user_id: user.id,
        remitente: "usuario",
        contenido: "Aprobé este plan.",
        plan_solicitud_id: id,
      })

    if (mensajeError) {
      console.error("Error creando mensaje de aprobación:", mensajeError)
    }
  }

  const emailResult = await sendOdiseoEmail({
    to: adminEmail,
    subject: `Plan aprobado — ${solicitud.nombre}`,
    replyTo: user.email ?? undefined,
    html: `
      <h2>Plan aprobado</h2>
      <p><strong>Usuario:</strong> ${escapeHtml(user.email)}</p>
      <p><strong>Nombre:</strong> ${escapeHtml(solicitud.nombre)}</p>
      <p><strong>Deseo:</strong></p>
      <p>${escapeHtml(solicitud.deseo)}</p>
      <hr>
      <p><a href="${siteUrl}/es/admin/mensajes">Ver conversación →</a></p>
    `,
  })

  return NextResponse.json({ ok: true, emailSent: emailResult.sent })
}
