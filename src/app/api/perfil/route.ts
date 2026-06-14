import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

type ProfileRow = {
  full_name?: string | null
  display_name?: string | null
  email?: string | null
  avatar_url?: string | null
  nombre_preferido?: string | null
  [key: string]: unknown
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const admin = createAdminClient()
  // select * avoids column-not-exist errors — missing columns simply aren't returned
  const { data } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  const profile = (data ?? {}) as ProfileRow
  const metaNombre = (user.user_metadata?.nombre_preferido as string | undefined) ?? ""

  return NextResponse.json({
    email: user.email ?? "",
    fullName: profile.full_name ?? "",
    displayName: profile.display_name ?? "",
    nombrePreferido: profile.nombre_preferido || metaNombre,
    avatarUrl: profile.avatar_url ?? "",
  })
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const body = (await req.json()) as {
    fullName?: string
    nombrePreferido?: string
  }

  const admin = createAdminClient()

  // Try updating with nombre_preferido first
  const { error } = await admin
    .from("profiles")
    .update({
      full_name: body.fullName ?? undefined,
      display_name: body.nombrePreferido || body.fullName || undefined,
      nombre_preferido: body.nombrePreferido ?? undefined,
    })
    .eq("id", user.id)

  if (error) {
    if (error.code === "42703") {
      // Column doesn't exist yet — run migration, then update without it
      const { error: e2 } = await admin
        .from("profiles")
        .update({
          full_name: body.fullName ?? undefined,
          display_name: body.nombrePreferido || body.fullName || undefined,
        })
        .eq("id", user.id)
      if (e2) return NextResponse.json({ error: e2.message }, { status: 500 })
    } else {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
