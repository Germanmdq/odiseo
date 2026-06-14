import { NextRequest, NextResponse } from "next/server"

import { embedQuery } from "@/lib/nvidia"
import { createAdminClient } from "@/lib/supabase/admin"
import { getContentArtifactsByIds } from "@/lib/content-artifacts/data"

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { query?: string }
  const query = body.query?.trim()

  if (!query) {
    return NextResponse.json({ error: "query required" }, { status: 400 })
  }

  let embedding: number[]
  try {
    embedding = await embedQuery(query)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Embedding failed"
    return NextResponse.json({ error: message }, { status: 502 })
  }

  const supabase = createAdminClient()
  const { data: matches, error } = await supabase.rpc("match_content_artifacts", {
    query_embedding: embedding,
    filter_subtype: "respuesta_pregunta",
    match_count: 5,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const ids = ((matches ?? []) as Array<{ id: string }>).map((m) => m.id)
  const artifacts = await getContentArtifactsByIds(ids)

  const similarityMap = new Map(
    ((matches ?? []) as Array<{ id: string; similarity: number }>).map((m) => [
      m.id,
      m.similarity,
    ])
  )

  const results = artifacts.map((a) => ({
    ...a,
    similarity: similarityMap.get(a.id) ?? null,
  }))

  return NextResponse.json({ results })
}
