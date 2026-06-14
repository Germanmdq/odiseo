import { NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const maxDuration = 60

const NVIDIA_CHAT_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
const NVIDIA_CHAT_MODEL = "meta/llama-3.3-70b-instruct"

function buildPrompt(fragmentos: string[]) {
  const joined = fragmentos
    .map((f, i) => `[Fragmento ${i + 1}]\n${f}`)
    .join("\n\n---\n\n")

  return `A partir de estos fragmentos del proceso personal del usuario, escribí un capítulo de su libro en primera persona, conectando las ideas en una narrativa reflexiva coherente, en español rioplatense neutro.

Los fragmentos son apuntes, escenas y reflexiones que el usuario fue guardando en su recorrido. Tu tarea es darles forma de capítulo de libro personal: fluido, íntimo, sin numeraciones ni subtítulos técnicos.

Empezá con un título sugerido entre corchetes, ej: [Título sugerido: El momento en que entendí].

Luego escribí el capítulo directamente, en primera persona, sin introducción meta ("este capítulo trata de...") ni cierre explicativo.

Fragmentos:

${joined}`
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

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const apiKey = process.env.NVIDIA_API_KEY
  if (!apiKey) return Response.json({ error: "Falta NVIDIA_API_KEY" }, { status: 500 })

  const body = (await request.json()) as { memoriaIds?: string[] }
  const memoriaIds = body.memoriaIds ?? []

  if (!memoriaIds.length) {
    return Response.json({ error: "Seleccioná al menos una memoria" }, { status: 400 })
  }

  const { data: memorias, error } = await supabase
    .from("memoria")
    .select("id, content")
    .eq("user_id", user.id)
    .in("id", memoriaIds)

  if (error) return jsonDbError("Error loading memorias for chapter generation", error)
  if (!memorias?.length) {
    return Response.json({ error: "No se encontraron las memorias" }, { status: 404 })
  }

  const fragmentos = memorias.map((m) => {
    const c = m.content as { text?: string } | string
    if (typeof c === "string") return c
    return c?.text ?? ""
  }).filter(Boolean)

  const nvidiaResponse = await fetch(NVIDIA_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: NVIDIA_CHAT_MODEL,
      messages: [{ role: "user", content: buildPrompt(fragmentos) }],
      temperature: 0.4,
      top_p: 0.8,
      max_tokens: 2000,
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
