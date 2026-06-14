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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { error } = await supabase
    .from("memoria")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return jsonDbError("Error deleting memoria", error)
  return Response.json({ ok: true })
}
