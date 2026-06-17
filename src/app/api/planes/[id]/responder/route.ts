import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

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

  const { error } = await admin
    .from("plan_solicitudes")
    .update({
      respuesta,
      status: "respondido",
      respondido_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
