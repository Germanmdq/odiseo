import { NextRequest } from "next/server"

import { embedQuery } from "@/lib/nvidia"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"
export const maxDuration = 60

const NVIDIA_CHAT_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
const NVIDIA_CHAT_MODEL = "meta/llama-3.3-70b-instruct"

const NARRADOR_SYSTEM_PROMPT = `Sos el Narrador de Odiseo, una voz que
guía al usuario a través de escenas imaginadas, inspiradas en las técnicas
de Neville Goddard (especialmente SATS — la Técnica del Estado Similar al
Sueño — y "vivir desde el final"). Hablás en español rioplatense neutro.

Tu trabajo NO es dar consejos ni explicar teoría — es CONSTRUIR LA ESCENA.
Cuando el usuario te pide una escena (sobre seguridad, un trabajo nuevo,
abundancia, una relación, etc.), generás una narración INMERSIVA en
SEGUNDA PERSONA y TIEMPO PRESENTE, como si la persona ya estuviera viviendo
ese momento, AHORA:

- Apelá a los sentidos: qué VE, qué ESCUCHA, qué SIENTE en el cuerpo, qué
  HUELE o TOCA. La escena tiene que sentirse real, no descripta desde
  afuera.
- Incluí al menos un detalle de DIÁLOGO o INTERACCIÓN (alguien le dice
  algo, una reacción de otra persona) — el "tono de voz" de los demás
  confirmando la nueva realidad es muy efectivo en SATS.
- Elegí UNA escena breve y específica, no un resumen de toda una vida — un
  momento concreto (una conversación, un gesto, un instante de alivio o
  alegría).
- Extensión: 3 a 5 párrafos cortos.
- Cerrá SIEMPRE con una frase que invite a SOSTENER ese sentimiento — algo
  como "Quedate un momento más acá, sintiendo esto como ya real" o
  "Llevate esta sensación con vos al resto del día/antes de dormir".

Ritmo: pausado, cálido, casi hipnótico — frases no demasiado largas, con
espacio para imaginar. Evitá explicaciones técnicas ("esto es la técnica
SATS porque...") — eso ya lo sabe el usuario o lo conversa con el Coach;
acá solo se VIVE la escena.

Si el pedido del usuario es vago ("ayudame con una escena"), pedile UN dato
concreto (qué deseo, o qué emoción quiere sentir) antes de narrar — pero
si ya da contexto suficiente, narrá directamente sin más preguntas.`

type NarradorMessage = {
  role: "user" | "assistant" | "system"
  content: string
}

type MatchRow = {
  title?: string | null
  body?: string | null
  libros_citados?: string[] | null
  conferencias_citadas?: string[] | null
  source_table?: string | null
}

function trimContext(text: string | null | undefined) {
  const normalized = (text ?? "").replace(/\s+/g, " ").trim()
  if (normalized.length <= 400) return normalized
  return `${normalized.slice(0, 400)}...`
}

function formatSources(row: MatchRow) {
  const sources = [
    ...(row.libros_citados ?? []),
    ...(row.conferencias_citadas ?? []),
  ].filter(Boolean)

  if (sources.length) return sources.join("; ")
  return row.source_table ?? "Fuente no especificada"
}

function buildContext(rows: MatchRow[]) {
  if (!rows.length) return "No se recuperó contexto relevante."

  return rows
    .map((row, index) =>
      [
        `[${index + 1}] ${row.title || "Sin título"}`,
        `Fuente: ${formatSources(row)}`,
        `Contenido: ${trimContext(row.body)}`,
      ].join("\n")
    )
    .join("\n\n")
}

function buildSystemPrompt(context: string) {
  return `${NARRADOR_SYSTEM_PROMPT}

CONTEXTO RECUPERADO (puede ser relevante o no — usalo solo si encaja
naturalmente con el pedido, no lo fuerces):
${context}`
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

async function streamPlainTextFromNvidia(response: Response) {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const reader = response.body?.getReader()

  if (!reader) {
    return new Response("No se pudo leer la respuesta de NVIDIA.", { status: 502 })
  }

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
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Error leyendo el stream."
        controller.enqueue(encoder.encode(`\n\nError: ${message}`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.NVIDIA_API_KEY
    if (!apiKey) {
      return Response.json({ error: "Falta NVIDIA_API_KEY." }, { status: 500 })
    }

    const body = (await request.json()) as {
      messages?: NarradorMessage[]
    }

    const messages = (body.messages ?? []).filter(
      (message) => message.role !== "system" && message.content?.trim()
    )
    const lastUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user")

    if (!lastUserMessage) {
      return Response.json(
        { error: "El mensaje del usuario no puede estar vacío." },
        { status: 400 }
      )
    }

    const queryEmbedding = await embedQuery(lastUserMessage.content)
    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc("match_content_artifacts", {
      query_embedding: queryEmbedding,
      match_count: 5,
    })

    if (error) {
      throw new Error(error.message)
    }

    const context = buildContext((data ?? []) as MatchRow[])
    const nvidiaResponse = await fetch(NVIDIA_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: NVIDIA_CHAT_MODEL,
        messages: [
          { role: "system", content: buildSystemPrompt(context) },
          ...messages.slice(-12),
        ],
        temperature: 0.35,
        top_p: 0.8,
        max_tokens: 900,
        stream: true,
      }),
    })

    if (!nvidiaResponse.ok) {
      const errorText = await nvidiaResponse.text()
      return new Response(`Error de NVIDIA: ${errorText}`, { status: 502 })
    }

    return streamPlainTextFromNvidia(nvidiaResponse)
  } catch (error) {
    console.error("Error en /api/narrador:", error)
    const message =
      error instanceof Error ? error.message : "Error interno del servidor."
    return Response.json({ error: message }, { status: 500 })
  }
}
