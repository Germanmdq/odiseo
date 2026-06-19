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

  // Save nombre_preferido to auth metadata — always works regardless of profiles schema
  if (body.nombrePreferido !== undefined) {
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: { nombre_preferido: body.nombrePreferido },
    })
  }

  // Best-effort update on profiles — try all known columns first, fall back to full_name only
  const fullUpdate: Record<string, string | undefined> = {}
  if (body.fullName !== undefined) fullUpdate.full_name = body.fullName
  if (body.nombrePreferido !== undefined) {
    fullUpdate.nombre_preferido = body.nombrePreferido
    fullUpdate.display_name = body.nombrePreferido || body.fullName || undefined
  }

  if (Object.keys(fullUpdate).length > 0) {
    const withIdentity = {
      id: user.id,
      email: user.email,
      ...fullUpdate,
    }

    const { error } = await admin
      .from("profiles")
      .upsert(withIdentity, { onConflict: "id" })

    if (error && body.fullName !== undefined) {
      // Columns may not exist in older schemas — retry with the smallest safe shape.
      await admin
        .from("profiles")
        .upsert(
          { id: user.id, email: user.email, full_name: body.fullName },
          { onConflict: "id" }
        )
    }
  }

  return NextResponse.json({ ok: true })
}
