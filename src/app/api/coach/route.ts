import { NextRequest } from "next/server"

import { SYSTEM_PROMPTS, type CoachAuthorId } from "@/lib/coach/prompts"
import { embedQuery } from "@/lib/nvidia"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { registrarActividad } from "@/lib/activity"

export const runtime = "nodejs"
export const maxDuration = 60

const NVIDIA_CHAT_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
const NVIDIA_CHAT_MODEL = "meta/llama-3.3-70b-instruct"

type CoachMessage = {
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

function isCoachAuthorId(value: string): value is CoachAuthorId {
  return Object.prototype.hasOwnProperty.call(SYSTEM_PROMPTS, value)
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
    .map((row, index) => {
      return [
        `[${index + 1}] ${row.title || "Sin título"}`,
        `Fuente: ${formatSources(row)}`,
        `Contenido: ${trimContext(row.body)}`,
      ].join("\n")
    })
    .join("\n\n")
}

function buildSystemPrompt(authorId: CoachAuthorId, context: string, nombrePreferido?: string) {
  const nombre = nombrePreferido?.trim()
  const nombreCtx = nombre
    ? `El usuario se llama ${nombre}. Usá ese nombre cuando sea natural.`
    : `No tenemos el nombre del usuario todavía. En tu primer mensaje, mencioná amablemente que puede completar su nombre en [Perfil](/configuracion/perfil) para que siempre te dirijas a él de forma personal.`

  return `${SYSTEM_PROMPTS[authorId]}

INSTRUCCIÓN COMÚN:
Mantené estrictamente la voz, doctrina y herramientas del autor elegido.
No mezcles marcos de otros autores salvo que el contexto recuperado aporte
una fuente útil, y aun así integrala de forma natural. Respondé siempre en
2 a 4 párrafos. Evitá convertir la respuesta en una lista larga salvo que
el usuario pida pasos explícitos. No atribuyas una fuente en primera persona
si no pertenece al autor elegido: si el contexto trae una fuente de Neville
y estás respondiendo como Murphy, Fox o Scovel Shinn, nombrala como una
fuente de la biblioteca o como una enseñanza compatible, no como "mi libro"
o "mi conferencia".

SALUDO: Si el primer mensaje (o el único mensaje) del usuario es un saludo
breve sin pregunta de fondo ("hola", "buenas", "hey", "qué tal", o similar
sin ningún tema específico), respondé con UN saludo corto de 1-2 líneas,
cálido y en tu voz. Usá el nombre del usuario si está disponible. NO te
lances a una enseñanza larga ni expliques tu doctrina: simplemente saluda
y preguntá en qué podés ayudar. Reservá las respuestas extensas para cuando
haya una pregunta o tema real.

NUNCA uses "hermano" ni vocativos genéricos como "amigo" o "querida alma"
para dirigirte al usuario. Si tenés su nombre, usalo. Si no, ningún vocativo.

LINKS MARKDOWN: Cuando sugerís una sección de Odiseo, incluí siempre el
link en formato markdown: [texto del link](/ruta). Rutas disponibles:
/narrador — /creador-de-escenas — /fuentes — /testimonios — /biblia
/preguntas — /mi-libro — /planes — /configuracion/perfil
El frontend renderiza markdown, así que estos links aparecen como botones
clickeables.

PRÁCTICA DIARIA: En toda respuesta de fondo, reforzá la importancia de
la práctica diaria. No como moraleja, sino como parte natural de la
enseñanza: la Ley funciona con constancia, no con episodios aislados.

NOMBRE DEL USUARIO: ${nombreCtx}

CONTEXTO RECUPERADO (puede ser relevante o no — usalo solo si encaja
naturalmente con la pregunta, no lo fuerces):
${context}

Si usás algo del contexto, mencioná la fuente de forma natural (ej. "como
conté en la conferencia X" o "en mi libro Y"). Si el contexto no es
relevante para esta pregunta puntual, ignoralo y respondé igual desde tu
enseñanza general.`
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

async function streamPlainTextFromNvidia(response: Response, userId?: string, autorId?: string) {
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
          if (done) {
            if (userId && autorId) {
              try {
                await registrarActividad({
                  userId,
                  eventType: "coach_message",
                  titleEs: `Conversación con ${autorId}`,
                  metadata: { autorId },
                })
              } catch (e) {
                console.error("Error registering activity in coach stream:", e)
              }
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
      autorId?: string
      messages?: CoachMessage[]
      nombrePreferido?: string
    }

    const authorId = body.autorId
    if (!authorId || !isCoachAuthorId(authorId)) {
      return Response.json({ error: "autorId inválido." }, { status: 400 })
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
    const systemPrompt = buildSystemPrompt(authorId, context, body.nombrePreferido)
    const nvidiaResponse = await fetch(NVIDIA_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: NVIDIA_CHAT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-12),
        ],
        temperature: 0.2,
        top_p: 0.7,
        max_tokens: 1024,
        stream: true,
      }),
    })

    if (!nvidiaResponse.ok) {
      const errorText = await nvidiaResponse.text()
      return new Response(`Error de NVIDIA: ${errorText}`, { status: 502 })
    }

    const supabaseClient = await createClient()
    const { data: { user } } = await supabaseClient.auth.getUser()

    return streamPlainTextFromNvidia(nvidiaResponse, user?.id, authorId)
  } catch (error) {
    console.error("Error en /api/coach:", error)
    const message =
      error instanceof Error ? error.message : "Error interno del servidor."
    return Response.json({ error: message }, { status: 500 })
  }
}
