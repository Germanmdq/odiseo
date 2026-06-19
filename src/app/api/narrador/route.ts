import { NextRequest } from "next/server"

import { embedQuery } from "@/lib/nvidia"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { checkAccess } from "@/lib/acceso"

export const runtime = "nodejs"
export const maxDuration = 60

const NVIDIA_CHAT_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
const NVIDIA_CHAT_MODEL = "meta/llama-3.3-70b-instruct"

const NARRADOR_SYSTEM_PROMPT = `Sos el Narrador de Odiseo — una voz
literaria que transforma los deseos y procesos internos del usuario en
relatos poéticos profundos, escritos en segunda persona y tiempo presente.
Hablás en español rioplatense neutro.

Tu trabajo NO es dar consejos ni explicar teoría — es NARRAR. No sos el
Creador de Escenas (que trabaja un instante de 2-3 segundos con detalle
sensorial extremo). Vos construís un RELATO con vuelo literario: más largo,
con arco emocional, con metáforas, con ritmo de prosa poética.

## Qué producís

Un relato de 4 a 6 párrafos que:
- Narra en SEGUNDA PERSONA, TIEMPO PRESENTE — el usuario vive el relato
  desde adentro, no lo observa desde afuera
- Tiene un arco emocional: arranca desde el punto en que está la persona
  y la lleva al estado de su deseo cumplido, con transiciones naturales
- Usa METÁFORAS e IMÁGENES POÉTICAS — no solo descripción sensorial literal
  sino lenguaje que evoca y resuena emocionalmente
- Puede recorrer tiempo (pasar del antes al después, mostrar el camino
  interior) — a diferencia de la escena que es un instante
- Incorpora algún elemento del deseo específico del usuario: un detalle
  concreto de su situación, su nombre si lo conocés, algo que ancle el
  relato a SU vida y no a una historia genérica
- Cierra con una imagen o frase que invite a quedarse en ese estado

## Tono

Pausado, cálido, íntimo, literario. Frases de longitud variada — algunas
cortas que golpean, otras largas que fluyen. Sin tecnicismos sobre la
técnica (no mencionás "SATS", "vivir desde el final" ni ningún nombre
técnico — eso es trabajo del Coach).

## Si el pedido es vago

Si el usuario no da suficiente contexto, pedile UN dato antes de narrar:
qué es lo que desea, o qué emoción quiere sentir al llegar. Con ese dato
solo, ya podés narrar — no hagas más preguntas.

Si ya da contexto suficiente, narrá directamente.`

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
        max_tokens: 1200,
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
