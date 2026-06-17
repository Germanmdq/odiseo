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

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("mi_libro_libros")
    .select(`
      *,
      mi_libro_capitulos (
        id
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return jsonDbError("Error loading mi_libro_libros", error)

  const libros = (data ?? []).map((libro) => {
    const caps = libro.mi_libro_capitulos
    const count = Array.isArray(caps) ? caps.length : 0
    // Remove the relation field from the final response
    const { mi_libro_capitulos, ...rest } = libro
    return {
      ...rest,
      cantidadCapitulos: count,
    }
  })

  return Response.json({ libros })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = (await request.json()) as {
    titulo?: string
    descripcion?: string
  }

  const { data, error } = await supabase
    .from("mi_libro_libros")
    .insert({
      user_id: user.id,
      titulo: body.titulo?.trim() || "Sin título",
      descripcion: body.descripcion || "",
    })
    .select("*")
    .single()

  if (error) return jsonDbError("Error inserting mi_libro_libros", error)
  return Response.json({ libro: data })
}
