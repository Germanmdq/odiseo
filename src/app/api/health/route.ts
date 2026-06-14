import { NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const supabase = createAdminClient()
  const { count, error } = await supabase
    .from("content_artifacts")
    .select("*", { count: "exact", head: true })

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, artifacts: count ?? 0 })
}
