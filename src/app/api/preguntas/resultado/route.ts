import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { embedQuery } from "@/lib/nvidia"

export const runtime = "nodejs"
export const maxDuration = 30

const HITOS = [3, 7, 30]

function todayUTC(): string {
  return new Date().toISOString().split("T")[0]
}

function yesterdayUTC(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().split("T")[0]
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const body = (await request.json()) as {
    tema?: string
    totalPreguntas?: number
    respuestasCorrectas?: number
    puntaje?: number
  }

  const { tema, totalPreguntas, respuestasCorrectas, puntaje } = body
  if (!tema || totalPreguntas == null || respuestasCorrectas == null || puntaje == null) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
  }

  const admin = createAdminClient()
  const today = todayUTC()
  const yesterday = yesterdayUTC()

  // ── Streak logic ─────────────────────────────────────────
  const { data: rachaRow } = await admin
    .from("rachas")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  let racha_actual: number
  let racha_maxima: number
  let puntos_totales: number
  let alreadyToday = false

  if (!rachaRow) {
    racha_actual = 1
    racha_maxima = 1
    puntos_totales = puntaje
  } else {
    racha_actual = rachaRow.racha_actual as number
    racha_maxima = rachaRow.racha_maxima as number
    puntos_totales = (rachaRow.puntos_totales as number) + puntaje

    const ultima = rachaRow.ultima_evaluacion as string | null
    if (ultima === today) {
      alreadyToday = true
    } else if (ultima === yesterday) {
      racha_actual += 1
    } else {
      racha_actual = 1
    }
    racha_maxima = Math.max(racha_maxima, racha_actual)
  }

  const hito = !alreadyToday && HITOS.includes(racha_actual) ? racha_actual : null

  await admin.from("rachas").upsert(
    {
      user_id: user.id,
      racha_actual,
      racha_maxima,
      puntos_totales,
      ultima_evaluacion: today,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  )

  // ── Save to evaluaciones ──────────────────────────────────
  const { data: evalRow } = await admin
    .from("evaluaciones")
    .insert({
      user_id: user.id,
      tema,
      total_preguntas: totalPreguntas,
      respuestas_correctas: respuestasCorrectas,
      puntaje,
    })
    .select("id")
    .single()

  // ── Find best Neville answer for this topic ───────────────
  let respuesta_neville = null
  try {
    const embedding = await embedQuery(tema)
    const { data: matches } = await admin.rpc("match_content_artifacts", {
      query_embedding: embedding,
      filter_subtype: "respuesta_pregunta",
      match_count: 1,
    })

    const topMatch = (matches as Array<{ id: string }> | null)?.[0]
    if (topMatch) {
      const { data: artifact } = await admin
        .from("content_artifacts")
        .select(
          "id, title, pregunta_original, body, libros_citados, conferencias_citadas"
        )
        .eq("id", topMatch.id)
        .maybeSingle()

      if (artifact) {
        const librosCitados = Array.isArray(artifact.libros_citados)
          ? (artifact.libros_citados as string[])
          : []
        const conferenciasCitadas = Array.isArray(artifact.conferencias_citadas)
          ? (artifact.conferencias_citadas as string[])
          : []

        respuesta_neville = {
          id: artifact.id as string,
          title: (artifact.title as string) ?? "",
          pregunta_original: (artifact.pregunta_original as string | null) ?? null,
          body: (artifact.body as string) ?? "",
          librosCitados,
          conferenciasCitadas,
        }

        // Auto-save to memoria
        await admin.from("memoria").insert({
          user_id: user.id,
          item_type: "evaluacion",
          title: `Evaluación — ${tema}`,
          content: {
            text: artifact.body,
            meta: { tema, puntaje, totalPreguntas, respuestasCorrectas },
          },
          source: `Evaluación — ${tema}`,
          status: "active",
          updated_at: new Date().toISOString(),
        })

        // Update evaluacion with respuesta_neville_id
        if (evalRow?.id) {
          await admin
            .from("evaluaciones")
            .update({ respuesta_neville_id: artifact.id as string })
            .eq("id", evalRow.id as string)
        }
      }
    }
  } catch {
    // Non-fatal — proceed without Neville answer
  }

  return NextResponse.json({
    racha_actual,
    racha_maxima,
    puntos_totales,
    hito,
    respuesta_neville,
  })
}
