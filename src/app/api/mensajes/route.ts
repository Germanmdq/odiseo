import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("mensajes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const body = (await req.json()) as { contenido?: string; planSolicitudId?: string }
  if (!body.contenido?.trim()) {
    return NextResponse.json({ error: "El mensaje no puede estar vacío" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("mensajes")
    .insert({
      user_id: user.id,
      remitente: "usuario",
      contenido: body.contenido.trim(),
      plan_solicitud_id: body.planSolicitudId || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notificar a Germán por email
  try {
    await resend.emails.send({
      from: "Odiseo <noreply@odiseo.online>",
      to: "quotesneville@gmail.com",
      subject: `Nuevo mensaje de usuario — Odiseo`,
      html: `
        <p><strong>De:</strong> ${user.email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${body.contenido}</p>
        <hr>
        <p><a href="https://odiseo.online/es/admin/mensajes">Responder desde el admin →</a></p>
      `,
    })
  } catch (e) {
    console.error("Error enviando email:", e)
  }

  return NextResponse.json({ ok: true, data })
}
