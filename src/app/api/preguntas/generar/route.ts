import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 60

const NVIDIA_CHAT_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
const NVIDIA_CHAT_MODEL = "meta/llama-3.3-70b-instruct"

type Pregunta = {
  pregunta: string
  opciones: { a: string; b: string; c: string; d: string }
  correcta: "a" | "b" | "c" | "d"
  explicacion: string
}

function buildPrompt(tema: string, cantidad: number): string {
  return `Generá exactamente ${cantidad} preguntas de evaluación sobre "${tema}" basadas en las enseñanzas de Neville Goddard.

Cada pregunta debe:
- Tener exactamente 4 opciones (a, b, c, d)
- Tener UNA sola respuesta correcta
- Evaluar comprensión real de la enseñanza, no memorización de frases
- Variar en dificultad (algunas fáciles, algunas que requieren pensar)

Respondé SOLO con un JSON válido, sin texto adicional ni backticks:
[
  {
    "pregunta": "string",
    "opciones": { "a": "string", "b": "string", "c": "string", "d": "string" },
    "correcta": "a",
    "explicacion": "string — por qué esa es la correcta, en 1-2 líneas"
  }
]`
}

async function callChat(prompt: string): Promise<string> {
  const res = await fetch(NVIDIA_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: NVIDIA_CHAT_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
      stream: false,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`NVIDIA chat error: ${res.status} ${body}`)
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  return data.choices?.[0]?.message?.content ?? ""
}

function extractAndParse(text: string): unknown {
  // Strip markdown code fences if present
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (fenced) return JSON.parse(fenced[1])

  // Try to find a JSON array directly
  const arrMatch = text.match(/\[[\s\S]*\]/)
  if (arrMatch) return JSON.parse(arrMatch[0])

  return JSON.parse(text.trim())
}

function validatePreguntas(data: unknown, expected: number): data is Pregunta[] {
  if (!Array.isArray(data) || data.length < 1 || data.length > expected + 2) return false
  return data.every((p) => {
    if (typeof p !== "object" || p === null) return false
    const obj = p as Record<string, unknown>
    const opts = obj.opciones as Record<string, unknown>
    return (
      typeof obj.pregunta === "string" &&
      typeof opts === "object" &&
      opts !== null &&
      ["a", "b", "c", "d"].every((k) => typeof opts[k] === "string") &&
      ["a", "b", "c", "d"].includes(obj.correcta as string) &&
      typeof obj.explicacion === "string"
    )
  })
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { tema?: string; cantidad?: number }
  const tema = body.tema?.trim()
  const cantidad = typeof body.cantidad === "number" ? body.cantidad : 0

  if (!tema || cantidad < 1 || cantidad > 10) {
    return NextResponse.json({ error: "tema y cantidad (1-10) son requeridos" }, { status: 400 })
  }

  const apiKey = process.env.NVIDIA_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "NVIDIA_API_KEY no configurada" }, { status: 500 })
  }

  const prompt = buildPrompt(tema, cantidad)

  for (let attempt = 0; attempt < 2; attempt++) {
    let raw: string
    try {
      raw = await callChat(prompt)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al llamar a la IA"
      return NextResponse.json({ error: msg }, { status: 502 })
    }

    let parsed: unknown
    try {
      parsed = extractAndParse(raw)
    } catch {
      if (attempt === 0) continue
      return NextResponse.json(
        { error: "La IA no devolvió un JSON válido. Intentá de nuevo." },
        { status: 502 }
      )
    }

    if (!validatePreguntas(parsed, cantidad)) {
      if (attempt === 0) continue
      return NextResponse.json(
        { error: "Las preguntas generadas no tienen el formato correcto. Intentá de nuevo." },
        { status: 502 }
      )
    }

    return NextResponse.json({ preguntas: parsed })
  }

  return NextResponse.json({ error: "No se pudieron generar las preguntas." }, { status: 502 })
}
