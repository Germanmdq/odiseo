import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

function jsonDbError(message: string, error: unknown) {
  console.error(message, error)
  const dbError = error as {
    message?: string
    code?: string
    details?: string
    hint?: string
  }

  return Response.json(
    {
      error: dbError.message ?? "Error de base de datos",
      code: dbError.code,
      details: dbError.details,
      hint: dbError.hint,
    },
    { status: 500 }
  )
}

async function updateChapter(
  request: NextRequest,
  id: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = (await request.json()) as {
    titulo?: string
    contenido?: string
    orden?: number
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.titulo !== undefined) updates.titulo = body.titulo
  if (body.contenido !== undefined) updates.contenido = body.contenido
  if (body.orden !== undefined) updates.orden = body.orden

  const { data, error } = await supabase
    .from("mi_libro_capitulos")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single()

  if (error) return jsonDbError("Error updating chapter", error)
  return Response.json({ capitulo: data })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return updateChapter(request, id)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return updateChapter(request, id)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { error } = await supabase
    .from("mi_libro_capitulos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return jsonDbError("Error deleting chapter", error)
  return Response.json({ ok: true })
}
