import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

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

  // Obtener email del usuario para notificarle
  if (solicitud) {
    try {
      const { data: userData } = await admin.auth.admin.getUserById(solicitud.user_id)
      if (userData?.user?.email) {
        await resend.emails.send({
          from: "Odiseo <noreply@odiseo.online>",
          to: userData.user.email,
          subject: "Tu plan personalizado está listo",
          html: `
            <h2>Hola ${solicitud.nombre},</h2>
            <p>Germán preparó tu plan personalizado. Podés verlo en Odiseo en la sección Mensajes.</p>
            <p><a href="https://odiseo.online/es/mensajes">Ver mi plan →</a></p>
          `,
        })
      }
    } catch (e) {
      console.error("Error enviando email al usuario:", e)
    }
  }

  return NextResponse.json({ ok: true })
}
