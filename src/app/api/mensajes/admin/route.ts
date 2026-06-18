import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user?.email !== "germangonzalezmdq@gmail.com") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const body = (await req.json()) as { userId: string; contenido: string; planSolicitudId?: string }
  const admin = createAdminClient()

  const { error } = await admin
    .from("mensajes")
    .insert({
      user_id: body.userId,
      remitente: "german",
      contenido: body.contenido.trim(),
      plan_solicitud_id: body.planSolicitudId || null,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notificar al usuario
  try {
    const { data: userData } = await admin.auth.admin.getUserById(body.userId)
    if (userData?.user?.email) {
      await resend.emails.send({
        from: "Odiseo <onboarding@resend.dev>",
        to: userData.user.email,
        subject: "Germán te respondió en Odiseo",
        html: `
          <p>Hola, Germán te envió un mensaje en Odiseo.</p>
          <p><strong>Mensaje:</strong></p>
          <p>${body.contenido}</p>
          <hr>
          <p><a href="https://odiseo.online/es/mensajes">Ver y responder →</a></p>
        `,
      })
    }
  } catch (e) {
    console.error("Error enviando email:", e)
  }

  return NextResponse.json({ ok: true })
}
