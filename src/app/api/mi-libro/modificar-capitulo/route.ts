import { NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { checkAccess } from "@/lib/acceso"

export const runtime = "nodejs"
export const maxDuration = 60
export const dynamic = "force-dynamic"

const NVIDIA_CHAT_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
const NVIDIA_CHAT_MODEL = "meta/llama-3.3-70b-instruct"

function buildPrompt({
  titulo,
  contenido,
  instruccion,
}: {
  titulo: string
  contenido: string
  instruccion: string
}) {
  return `Reescribí este capítulo del libro personal del usuario siguiendo la instrucción indicada.

Título actual: ${titulo}

Capítulo actual:
${contenido}

Instrucción del usuario:
${instruccion}

Reglas:
- Devolvé solo el contenido final del capítulo, sin explicaciones ni meta-texto.
- Mantené español rioplatense, tono íntimo, claro y reflexivo.
- Respetá la voz en primera persona.
- No inventes datos biográficos concretos que no estén en el texto.
- Si la instrucción pide modificar una parte, conservá todo lo demás lo más estable posible.`
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { allowed } = await checkAccess(user.id)
  if (!allowed) return Response.json({ error: "paywall" }, { status: 403 })

  const apiKey = process.env.NVIDIA_API_KEY
  if (!apiKey) return Response.json({ error: "Falta NVIDIA_API_KEY" }, { status: 500 })

  const body = (await request.json()) as {
    titulo?: string
    contenido?: string
    instruccion?: string
  }

  const titulo = body.titulo?.trim() || "Capítulo"
  const contenido = body.contenido?.trim() ?? ""
  const instruccion = body.instruccion?.trim() ?? ""

  if (!contenido || !instruccion) {
    return Response.json(
      { error: "El contenido y la instrucción son requeridos" },
      { status: 400 }
    )
  }

  const nvidiaResponse = await fetch(NVIDIA_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: NVIDIA_CHAT_MODEL,
      messages: [
        {
          role: "user",
          content: buildPrompt({
            titulo: titulo.slice(0, 300),
            contenido: contenido.slice(0, 12000),
            instruccion: instruccion.slice(0, 1200),
          }),
        },
      ],
      temperature: 0.45,
      top_p: 0.85,
      max_tokens: 1800,
      stream: false,
    }),
  })

  if (!nvidiaResponse.ok) {
    const errorText = await nvidiaResponse.text()
    return new Response(`Error de NVIDIA: ${errorText}`, { status: 502 })
  }

  const data = (await nvidiaResponse.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const contenidoFinal = data.choices?.[0]?.message?.content?.trim()

  if (!contenidoFinal) {
    return Response.json({ error: "No se pudo modificar el capítulo" }, { status: 502 })
  }

  return Response.json({ contenido: contenidoFinal })
}
