import { NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { registrarActividad } from "@/lib/activity"
import { checkAccess } from "@/lib/acceso"

export const runtime = "nodejs"
export const maxDuration = 60
export const dynamic = "force-dynamic"

const NVIDIA_CHAT_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
const NVIDIA_CHAT_MODEL = "meta/llama-3.3-70b-instruct"

function buildPromptDesdeTema(tema: string) {
  return `Escribí un capítulo reflexivo y profundo sobre "${tema}" desde la perspectiva de las enseñanzas de Neville Goddard, en primera persona del usuario, como si fuera parte de su libro personal de práctica espiritual. Español rioplatense, entre 400 y 600 palabras.

El capítulo debe:
- Empezar con un título sugerido entre corchetes, ej: [Título sugerido: El momento en que entendí]
- Estar escrito en primera persona, íntimo y reflexivo
- Conectar la enseñanza de Neville con la experiencia interna del practicante
- No ser una clase ni una explicación teórica — es una vivencia narrada
- Terminar con una idea que invite a seguir practicando

Escribí el título y luego el capítulo directamente, sin meta-texto.`
}

function buildPromptDesdeFuente(fuente: string) {
  return `Usá el siguiente contenido como BASE y FUENTE PRINCIPAL para escribir un capítulo del libro personal del usuario. No inventes desde cero ni lo ignores: partí de este material, profundizalo y dale forma de capítulo reflexivo. Conservá las ideas y el espíritu de lo que el usuario trajo.

El capítulo debe:
- Empezar con un título sugerido entre corchetes, ej: [Título sugerido: El momento en que entendí]
- Estar escrito en primera persona del usuario, íntimo y reflexivo
- Tomar el contenido base como punto de partida real (no como un tema abstracto)
- Conectar con las enseñanzas de Neville Goddard cuando sea natural
- No ser una clase ni una explicación teórica — es una vivencia narrada
- Español rioplatense
- Terminar con una idea que invite a seguir practicando

Escribí el título y luego el capítulo directamente, sin meta-texto.

CONTENIDO BASE:
${fuente}`
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

  const { allowed } = await checkAccess(user.id)
  if (!allowed) return Response.json({ error: "paywall" }, { status: 403 })

  const apiKey = process.env.NVIDIA_API_KEY
  if (!apiKey) return Response.json({ error: "Falta NVIDIA_API_KEY" }, { status: 500 })

  const body = (await request.json()) as { tema?: string; fuente?: string; libroId?: string }
  const rawFuente = body.fuente?.trim() ?? ""
  const rawTema = body.tema?.trim() ?? ""
  const libroId = body.libroId
  const esFuente = rawFuente.length > 0
  // Camino "fuente" (contenido compartido como insumo real): tope más alto
  // para no perder información de la fuente original. Tema corto: tope normal.
  const fuente = rawFuente.slice(0, 6000)
  const tema = rawTema.slice(0, 2000)

  if (!esFuente && !tema) {
    return Response.json({ error: "El tema es requerido" }, { status: 400 })
  }

  const promptContent = esFuente ? buildPromptDesdeFuente(fuente) : buildPromptDesdeTema(tema)
  // Salida amplia para el camino fuente: priorizar no cortar el capítulo.
  const maxTokens = esFuente ? 4000 : 1500

  const nvidiaResponse = await fetch(NVIDIA_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: NVIDIA_CHAT_MODEL,
      messages: [{ role: "user", content: promptContent }],
      temperature: 0.6,
      top_p: 0.9,
      max_tokens: maxTokens,
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
          if (done) {
            try {
              await registrarActividad({
                userId: user.id,
                eventType: "book",
                titleEs: esFuente ? "Capítulo generado desde contenido compartido" : `Capítulo generado: ${tema}`,
                metadata: { tema: esFuente ? undefined : tema, fuente: esFuente, libroId },
              })
            } catch (e) {
              console.error("Error registering activity in mi-libro stream:", e)
            }
            break
          }
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
