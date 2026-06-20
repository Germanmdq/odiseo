import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

// POST /api/auth/logout — cierra sesión server-side y limpia las cookies
// sb-* de forma confiable. Server-side no existe el Web Locks API del
// browser, así que signOut() no se cuelga y las cookies expiradas se
// devuelven en la respuesta. El matcher del middleware excluye /api.
export async function POST() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch (e) {
    console.error("Error en /api/auth/logout:", e)
  }
  return NextResponse.json({ ok: true })
}
