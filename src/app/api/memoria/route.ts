import { NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"

const VALID_TYPES = ["coach", "narrador", "pregunta", "plan", "manual", "evaluacion"] as const
type MemoriaType = (typeof VALID_TYPES)[number]

function isMemoriaType(value: string): value is MemoriaType {
  return VALID_TYPES.includes(value as MemoriaType)
}

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
    .from("memoria")
    .select("id, item_type, title, content, source, created_at")
    .eq("user_id", user.id)
    .or("status.eq.active,status.is.null")
    .order("created_at", { ascending: false })

  if (error) return jsonDbError("Error loading memoria", error)
  return Response.json({ memorias: data ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = (await request.json()) as {
    contenido?: string
    origenTipo?: string
    origenMeta?: Record<string, unknown>
    source?: string
  }

  const { contenido, origenTipo, origenMeta, source } = body
  if (!contenido?.trim() || !origenTipo?.trim()) {
    return Response.json({ error: "contenido y origenTipo son requeridos" }, { status: 400 })
  }

  if (!isMemoriaType(origenTipo)) {
    return Response.json({ error: `origenTipo inválido: ${origenTipo}` }, { status: 400 })
  }

  const sourceLabel = source ?? origenTipo
  const { data, error } = await supabase
    .from("memoria")
    .insert({
      user_id: user.id,
      item_type: origenTipo,
      title: sourceLabel,
      content: { text: contenido, meta: origenMeta ?? {} },
      source: sourceLabel,
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (error) return jsonDbError("Error inserting memoria", error)
  return Response.json({ id: data.id })
}
