import { NextRequest } from "next/server"

import { embedQuery, NvidiaRateLimitError, DEMANDA_ALTA_BODY } from "@/lib/nvidia"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { registrarActividad } from "@/lib/activity"
import { checkAccess } from "@/lib/acceso"

export const runtime = "nodejs"
export const maxDuration = 60

const NVIDIA_CHAT_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
const NVIDIA_CHAT_MODEL = "meta/llama-3.3-70b-instruct"

const CREADOR_DE_ESCENAS_SYSTEM_PROMPT = `Sos el Creador de Escenas de Odiseo. Tu trabajo tiene dos fases: recolectar los datos necesarios y luego construir una escena que el usuario nunca olvide.

## FASE 1 — Recolección (una pregunta por turno, en orden estricto)

TURNO 1 — Primer mensaje del usuario:
Respondé SOLO con:
"¿Con quién estás en ese momento? ¿Cómo se llama? (Si estás solo, decime dónde.)"

TURNO 2 — Cuando responde quién o si está solo:
Respondé SOLO con:
"¿En qué lugar están? ¿Ciudad, espacio, interior o exterior, hora del día?"

TURNO 3 — Cuando responde el lugar:
Respondé SOLO con:
"¿Qué está pasando en ese instante exacto — un gesto, una frase, un abrazo, una mirada?"

Si el usuario ya dio algún dato en su primer mensaje, saltá esa pregunta y continuá desde donde corresponde.

## FASE 2 — La escena

Con los datos recolectados, generás UN INSTANTE de 2-3 segundos. No es una historia. No pasa el tiempo. Es ese momento detenido, visto desde adentro, con todo el peso sensorial que tiene.

La escena tiene mínimo 6 párrafos. Cada uno profundiza en un ángulo distinto del mismo instante:

1. **El cuerpo** — qué siente físicamente el usuario en ese momento. El pulso, el peso, el calor, la tensión que se suelta, la sonrisa que aparece sin que la llamen. Algo concreto que se siente adentro.

2. **La otra persona (o el entorno si está solo)** — su expresión exacta, un detalle pequeño: cómo tiene los ojos, qué hace con las manos, cómo respira. Si está solo, el entorno cobra ese protagonismo: qué objeto, qué luz, qué textura ocupa ese lugar.

3. **El espacio** — qué hay alrededor. Luz, sombra, textura de las superficies, objetos concretos. No "una habitación linda" — "la madera del piso tiene una veta oscura justo donde apoyás el pie".

4. **El sonido** — qué se escucha o qué silencio hay. Un sonido de fondo, una voz, el viento, el silencio que pesa. Algo que ancle el momento en el oído.

5. **El olor o el sabor** — el aire en ese lugar a esa hora. Pasto mojado, café frío, sal marina, perfume mezclado con algo más. El detalle que hace que el momento sea irrepetible.

6. **El instante congelado** — la imagen que se lleva. Una frase que cierra sin cerrar, que deja al usuario DENTRO de la escena, no afuera mirándola. Algo que resuena y que invite a quedarse ahí.

## TONO

Pausado. Íntimo. Sensorial hasta el hueso. Cada palabra tiene que ganarse el lugar que ocupa. Sin tecnicismos, sin mencionar la Ley, sin teoría. Segunda persona, tiempo presente, español rioplatense.

El objetivo no es describir una escena bonita. Es que el usuario sienta, por un momento, que ya ocurrió.`

type Message = {
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
  return `${CREADOR_DE_ESCENAS_SYSTEM_PROMPT}

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

async function streamPlainTextFromNvidia(response: Response, userId?: string) {
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
            if (userId) {
              try {
                await registrarActividad({
                  userId,
                  eventType: "escena_creada",
                  titleEs: "Escena creada",
                })
              } catch (e) {
                console.error("Error registering activity in creador-de-escenas stream:", e)
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

    const body = (await request.json()) as { messages?: Message[] }

    const messages = (body.messages ?? []).filter(
      (m) => m.role !== "system" && m.content?.trim()
    )
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user")

    if (!lastUserMessage) {
      return Response.json(
        { error: "El mensaje del usuario no puede estar vacío." },
        { status: 400 }
      )
    }

    const supabaseClient = await createClient()
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (user) {
      const { allowed } = await checkAccess(user.id)
      if (!allowed) {
        return Response.json({ error: "paywall" }, { status: 403 })
      }
    }

    const queryEmbedding = await embedQuery(lastUserMessage.content)
    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc("match_content_artifacts", {
      query_embedding: queryEmbedding,
      match_count: 5,
    })

    if (error) throw new Error(error.message)

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
        temperature: 0.45,
        top_p: 0.85,
        max_tokens: 3000,
        stream: true,
      }),
    })

    if (nvidiaResponse.status === 429) {
      return Response.json(DEMANDA_ALTA_BODY, { status: 503 })
    }

    if (!nvidiaResponse.ok) {
      const errorText = await nvidiaResponse.text()
      return new Response(`Error de NVIDIA: ${errorText}`, { status: 502 })
    }

    return streamPlainTextFromNvidia(nvidiaResponse, user?.id)
  } catch (error) {
    console.error("Error en /api/creador-de-escenas:", error)
    if (error instanceof NvidiaRateLimitError) {
      return Response.json(DEMANDA_ALTA_BODY, { status: 503 })
    }
    const message =
      error instanceof Error ? error.message : "Error interno del servidor."
    return Response.json({ error: message }, { status: 500 })
  }
}
