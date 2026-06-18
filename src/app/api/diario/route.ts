import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { registrarActividad } from "@/lib/activity"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("diario_entradas")
    .select("id, content:contenido, fecha, created_at")
    .eq("user_id", user.id)
    .order("fecha", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const body = await req.json()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("diario_entradas")
    .insert({
      user_id: user.id,
      contenido: body.content ?? body.contenido,
      fecha: body.fecha ?? new Date().toISOString().split("T")[0],
    })
    .select("id, content:contenido, fecha, created_at")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  try {
    await registrarActividad({
      userId: user.id,
      eventType: "diario",
      titleEs: "Entrada en el diario",
    })
  } catch (e) {
    console.error("Error registering activity for diario:", e)
  }

  return NextResponse.json(data)
}
