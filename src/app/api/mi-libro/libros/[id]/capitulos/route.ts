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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("mi_libro_capitulos")
    .select("*")
    .eq("user_id", user.id)
    .eq("libro_id", id)
    .order("orden", { ascending: true })

  if (error) return jsonDbError("Error loading chapters", error)
  return Response.json({ capitulos: data ?? [] })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = (await request.json()) as {
    titulo?: string
    contenido?: string
    orden?: number
    memorias_origen?: string[]
  }

  // Calculate next orden specifically for this book
  const { data: existing, error: existingError } = await supabase
    .from("mi_libro_capitulos")
    .select("orden")
    .eq("libro_id", id)
    .order("orden", { ascending: false })
    .limit(1)

  if (existingError) return jsonDbError("Error calculating next chapter order", existingError)

  const nextOrden = (existing?.[0]?.orden ?? -1) + 1

  const { data, error } = await supabase
    .from("mi_libro_capitulos")
    .insert({
      user_id: user.id,
      libro_id: id,
      titulo: body.titulo?.trim() || "Nuevo capítulo",
      contenido: body.contenido ?? "",
      orden: body.orden ?? nextOrden,
      memorias_origen: body.memorias_origen ?? [],
    })
    .select("*")
    .single()

  if (error) return jsonDbError("Error inserting chapter", error)
  return Response.json({ capitulo: data })
}
