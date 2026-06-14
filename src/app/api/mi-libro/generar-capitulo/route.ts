import { NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const maxDuration = 60

const NVIDIA_CHAT_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
const NVIDIA_CHAT_MODEL = "meta/llama-3.3-70b-instruct"

function buildPrompt(tema: string) {
  return `Escribí un capítulo reflexivo y profundo sobre "${tema}" desde la perspectiva de las enseñanzas de Neville Goddard, en primera persona del usuario, como si fuera parte de su libro personal de práctica espiritual. Español rioplatense, entre 400 y 600 palabras.

El capítulo debe:
- Empezar con un título sugerido entre corchetes, ej: [Título sugerido: El momento en que entendí]
- Estar escrito en primera persona, íntimo y reflexivo
- Conectar la enseñanza de Neville con la experiencia interna del practicante
- No ser una clase ni una explicación teórica — es una vivencia narrada
- Terminar con una idea que invite a seguir practicando

Escribí el título y luego el capítulo directamente, sin meta-texto.`
}

function parseDelta(line: string) {
  if (!line.startsWith("data:")) return ""
  const payload = line.replace(/^data:\s*/, "")
  if (payload === "[DONE]") return ""
  try {
    const json = JSON.parse(payload) as {
      choices?: Array<{ delta?: { content?: string } }>
    }
    return json.choices?.[0]?.delta?.content ?? ""
  } catch {
    return ""
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const apiKey = process.env.NVIDIA_API_KEY
  if (!apiKey) return Response.json({ error: "Falta NVIDIA_API_KEY" }, { status: 500 })

  const body = (await request.json()) as { tema?: string }
  const tema = body.tema?.trim()

  if (!tema) {
    return Response.json({ error: "El tema es requerido" }, { status: 400 })
  }

  const nvidiaResponse = await fetch(NVIDIA_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: NVIDIA_CHAT_MODEL,
      messages: [{ role: "user", content: buildPrompt(tema) }],
      temperature: 0.6,
      top_p: 0.9,
      max_tokens: 1500,
      stream: true,
    }),
  })

  if (!nvidiaResponse.ok) {
    const errorText = await nvidiaResponse.text()
    return new Response(`Error de NVIDIA: ${errorText}`, { status: 502 })
  }

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const reader = nvidiaResponse.body?.getReader()

  if (!reader) return new Response("No se pudo leer la respuesta.", { status: 502 })

  let buffer = ""
  const stream = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""
          for (const line of lines) {
            const delta = parseDelta(line.trim())
            if (delta) controller.enqueue(encoder.encode(delta))
          }
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  })
}
