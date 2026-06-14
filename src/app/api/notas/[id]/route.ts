import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { content } = await req.json()
  if (!content?.trim()) return Response.json({ error: "content requerido" }, { status: 400 })

  const { data, error } = await supabase
    .from("notas")
    .update({ content: content.trim(), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, content, created_at, updated_at")
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const { error } = await supabase
    .from("notas")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return new Response(null, { status: 204 })
}
