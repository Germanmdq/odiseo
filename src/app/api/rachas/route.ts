import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const admin = createAdminClient()
  const { data } = await admin
    .from("rachas")
    .select("racha_actual, racha_maxima, puntos_totales")
    .eq("user_id", user.id)
    .maybeSingle()

  return NextResponse.json({
    racha_actual: data?.racha_actual ?? 0,
    racha_maxima: data?.racha_maxima ?? 0,
    puntos_totales: data?.puntos_totales ?? 0,
  })
}
