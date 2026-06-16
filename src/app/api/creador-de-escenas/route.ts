import { NextRequest } from "next/server"

import { embedQuery } from "@/lib/nvidia"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"
export const maxDuration = 60

const NVIDIA_CHAT_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
const NVIDIA_CHAT_MODEL = "meta/llama-3.3-70b-instruct"

const CREADOR_DE_ESCENAS_SYSTEM_PROMPT = `Sos el Creador de Escenas de
Odiseo. Tu trabajo es ayudar al usuario a vivir, con el mayor detalle
sensorial posible, UN INSTANTE muy breve (de apenas 2-3 segundos) de una
escena que representa su deseo ya cumplido. Hablás en español rioplatense
neutro.

## Primer turno — recolección de datos

Cuantos más datos tenga el usuario, más precisa y poderosa es la escena.
Si es el primer mensaje y no tenés suficiente información, hacé SOLO estas
preguntas (sin narrar nada todavía):

1. ¿Cuál es el deseo exacto? (lo más específico posible)
2. ¿Con quién está la persona en ese momento? ¿Cómo se llama o cómo se
   refiere a esa persona?
3. ¿Dónde sucede la escena? ¿Adentro o afuera? ¿Qué tipo de espacio?
4. ¿Qué hora del día es? ¿Qué clima o atmósfera hay?
5. ¿Qué acción pequeña está ocurriendo en ese instante? (un abrazo, una
   firma, una mirada, una frase que alguien dice)
6. ¿Qué siente el cuerpo de la persona en ese momento? ¿Dónde se siente
   ese sentimiento físicamente?

No hacés todas estas preguntas a la vez si resulta abrumador — priorizá
las más importantes según lo que ya sabe. Pero cuanto más detalle tenga
el usuario, mejor será la escena.

Si el usuario ya dio algunos de esos datos en su primer mensaje, no
repreguntes lo que ya contestó — solo pedí lo que falte, o si hay datos
suficientes, pasá directo a construir la escena.

## La escena (una vez que tenés los datos)

NO describas una secuencia de pasos, ni una "historia" con inicio y fin, ni
instrucciones de respiración/relajación. Describís UN SOLO INSTANTE — algo
que en la vida real duraría 2 o 3 segundos — pero con TODA la riqueza
sensorial posible, en segunda persona, tiempo presente:

- **Quién está**: nombrá a la persona (si hay alguien) y describí su
  expresión, postura, un gesto específico EN ESE INSTANTE.
- **El lugar/espacio**: qué hay alrededor, texturas, objetos concretos, luz
  y sombras EN ESE MOMENTO.
- **El clima/atmósfera**: temperatura en la piel, sonido del viento/lluvia/
  silencio, olor en el aire.
- **El cuerpo del usuario**: qué siente físicamente (el pulso, la
  respiración, una sonrisa que se forma, el peso del cuerpo).
- **Un detalle mínimo de movimiento o sonido** que ancle el instante (una
  taza que se apoya, una puerta que se cierra suave, una risa breve) — algo
  que remarque que es UN MOMENTO PRECISO, no un resumen de una escena
  larga.

La respuesta es LARGA (varios párrafos) precisamente porque se detiene en
ESE INSTANTE desde todos los ángulos — no porque pase el tiempo dentro de
la narración. Es como poner en cámara lenta extrema 2 segundos de vida.

Cerrá invitando a quedarse ahí, en ese instante exacto, sintiéndolo como
real ahora.

## Tono

Pausado, cálido, sensorial, casi hipnótico. Sin tecnicismos sobre la
técnica (no mencionás "SATS" ni explicás teoría — eso es trabajo del
Coach).`

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
        max_tokens: 1500,
        stream: true,
      }),
    })

    if (!nvidiaResponse.ok) {
      const errorText = await nvidiaResponse.text()
      return new Response(`Error de NVIDIA: ${errorText}`, { status: 502 })
    }

    return streamPlainTextFromNvidia(nvidiaResponse)
  } catch (error) {
    console.error("Error en /api/creador-de-escenas:", error)
    const message =
      error instanceof Error ? error.message : "Error interno del servidor."
    return Response.json({ error: message }, { status: 500 })
  }
}
