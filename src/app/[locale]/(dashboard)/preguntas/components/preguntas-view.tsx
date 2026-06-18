"use client"

import * as React from "react"
import { toast } from "sonner"
import { Flame, Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatBodyParagraphs } from "@/lib/format-body"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────

type Opcion = "a" | "b" | "c" | "d"

type TipoPregunta = "multiple" | "verdadero_falso" | "respuesta_breve"

type Pregunta = {
  pregunta: string
  opciones: Record<Opcion, string>
  correcta: Opcion
  explicacion: string
}

type RespuestaNeville = {
  id: string
  title: string
  pregunta_original: string | null
  body: string
  librosCitados: string[]
  conferenciasCitadas: string[]
}

type ResultadoAPI = {
  racha_actual: number
  racha_maxima: number
  puntos_totales: number
  hito: number | null
  respuesta_neville: RespuestaNeville | null
}

type EvaluacionHistorial = {
  id: string
  tema: string
  total_preguntas: number
  respuestas_correctas: number
  puntaje: number
  created_at: string
}

type Estado =
  | { etapa: "setup"; racha: number; puntosTotal: number }
  | { etapa: "generando"; tema: string; cantidad: number; tipo: TipoPregunta }
  | { etapa: "error"; mensaje: string; tema: string; cantidad: number; tipo: TipoPregunta }
  | {
      etapa: "evaluando"
      preguntas: Pregunta[]
      tema: string
      tipo: TipoPregunta
      indice: number
      elegidas: (Opcion | null)[]
      mostrandoFeedback: boolean
    }
  | { etapa: "enviando"; preguntas: Pregunta[]; tema: string; elegidas: Opcion[]; tipo: TipoPregunta }
  | {
      etapa: "resultado"
      tema: string
      preguntas: Pregunta[]
      elegidas: Opcion[]
      resultado: ResultadoAPI
      tipo: TipoPregunta
    }

// ── Constants ─────────────────────────────────────────────────────────────────

const OPCIONES: Opcion[] = ["a", "b", "c", "d"]

const HITO_MSGS: Record<number, string> = {
  3: "🔥 3 días seguidos. ¡Estás en racha!",
  7: "⚡ ¡Una semana entera! Racha de 7 días.",
  30: "🏆 ¡30 días! Sos un practicante comprometido.",
}

const TIPO_LABELS: Record<TipoPregunta, string> = {
  multiple: "Opción múltiple (4 opciones)",
  verdadero_falso: "Verdadero o falso",
  respuesta_breve: "Respuesta breve",
}

function performanceMsg(correctas: number, total: number, tema: string): string {
  const r = correctas / total
  if (r === 1) return `¡Perfecto! Tu comprensión de ${tema} es total.`
  if (r >= 0.7) return `Muy bien. Seguís avanzando en ${tema}.`
  if (r >= 0.4) return `Buen intento. Hay más para explorar en ${tema}.`
  return "Esta enseñanza tiene más profundidad de lo que parece. Vale la pena releerla."
}

const selectClass =
  "w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring appearance-none cursor-pointer"

// ── Sub-components ────────────────────────────────────────────────────────────

function SetupScreen({
  estado,
  onStart,
  initialTema = "",
}: {
  estado: Extract<Estado, { etapa: "setup" }>
  onStart: (tema: string, cantidad: number, tipo: TipoPregunta) => void
  initialTema?: string
}) {
  const [tema, setTema] = React.useState(initialTema)
  const [cantidad, setCantidad] = React.useState(5)
  const [tipo, setTipo] = React.useState<TipoPregunta>("multiple")

  function handleStart() {
    const t = tema.trim()
    if (!t) return
    onStart(t, cantidad, tipo)
  }

  return (
    <div className="mx-auto max-w-lg py-6">
      <div className="rounded-2xl border bg-card p-8 shadow-sm space-y-6">
        {estado.racha > 0 && (
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "#E8401A" }}>
            <Flame className="h-4 w-4" />
            <span>{estado.racha} {estado.racha === 1 ? "día" : "días"} de racha</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xl font-semibold block">
            ¿Sobre qué tema querés ponerte a prueba?
          </label>
          <input
            type="text"
            value={tema}
            onChange={e => setTema(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleStart() }}
            placeholder="Ej: la revisión, vivir desde el final, el autoconcepto..."
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground block">Cantidad de preguntas</label>
            <select
              value={cantidad}
              onChange={e => setCantidad(Number(e.target.value))}
              className={selectClass}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground block">Tipo de preguntas</label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value as TipoPregunta)}
              className={selectClass}
            >
              {(Object.entries(TIPO_LABELS) as [TipoPregunta, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <Button size="lg" className="w-full" onClick={handleStart} disabled={!tema.trim()}>
          Empezar
        </Button>
      </div>
    </div>
  )
}

function EvaluandoScreen({
  estado,
  onElegir,
  onSiguiente,
  onVerResultado,
}: {
  estado: Extract<Estado, { etapa: "evaluando" }>
  onElegir: (opcion: Opcion) => void
  onSiguiente: () => void
  onVerResultado: () => void
}) {
  const { preguntas, indice, elegidas, mostrandoFeedback, tipo } = estado
  const pregunta = preguntas[indice]
  const elegida = elegidas[indice]
  const respondidas = elegidas.filter(Boolean).length
  const correctasHasta = elegidas.filter((e, i) => e !== null && e === preguntas[i].correcta).length
  const esUltima = indice === preguntas.length - 1
  const [respuestaLibre, setRespuestaLibre] = React.useState("")

  React.useEffect(() => {
    setRespuestaLibre("")
  }, [indice])

  const opcionesVisibles: Opcion[] = tipo === "verdadero_falso" ? ["a", "b"] : OPCIONES

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Pregunta {indice + 1} de {preguntas.length}
          </span>
          <span>
            ✓ {correctasHasta} de {respondidas}
          </span>
        </div>
        <Progress value={((indice + (mostrandoFeedback ? 1 : 0)) / preguntas.length) * 100} />
      </div>

      <div className="rounded-lg border p-5">
        <p className="text-base font-medium leading-relaxed">{pregunta.pregunta}</p>
      </div>

      {tipo === "respuesta_breve" ? (
        <div className="space-y-3">
          <textarea
            value={respuestaLibre}
            onChange={e => setRespuestaLibre(e.target.value)}
            disabled={mostrandoFeedback}
            placeholder="Escribí tu respuesta aquí..."
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none disabled:opacity-60"
            rows={4}
          />
          {!mostrandoFeedback && (
            <Button
              onClick={() => onElegir("a")}
              disabled={!respuestaLibre.trim()}
            >
              Ver respuesta
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {opcionesVisibles.map((key) => (
            <button
              key={key}
              disabled={mostrandoFeedback}
              onClick={() => onElegir(key)}
              className={cn(
                "w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                "disabled:cursor-default",
                !mostrandoFeedback && "hover:bg-muted/60",
                mostrandoFeedback && key === pregunta.correcta
                  ? "border-green-500 bg-green-50 dark:bg-green-950/40"
                  : "",
                mostrandoFeedback && key === elegida && key !== pregunta.correcta
                  ? "border-red-500 bg-red-50 dark:bg-red-950/40"
                  : ""
              )}
            >
              <span className="mr-2 font-semibold uppercase">{key}.</span>
              {pregunta.opciones[key]}
            </button>
          ))}
        </div>
      )}

      {mostrandoFeedback && (
        <div className="animate-in fade-in space-y-1 rounded-lg border bg-muted/40 p-4 text-sm">
          {tipo === "respuesta_breve" ? (
            <>
              <p className="font-medium">Respuesta esperada</p>
              <p className="text-muted-foreground">{pregunta.opciones["a"]}</p>
              {pregunta.explicacion && (
                <p className="text-muted-foreground mt-1">{pregunta.explicacion}</p>
              )}
            </>
          ) : (
            <>
              <p className="font-medium">
                {elegida === pregunta.correcta ? "✓ Correcto" : "✗ Incorrecto"}
              </p>
              <p className="text-muted-foreground">{pregunta.explicacion}</p>
            </>
          )}
        </div>
      )}

      {mostrandoFeedback && (
        <div className="flex justify-end">
          {esUltima ? (
            <Button onClick={onVerResultado}>Ver resultado</Button>
          ) : (
            <Button onClick={onSiguiente}>Siguiente pregunta</Button>
          )}
        </div>
      )}
    </div>
  )
}

function ResultadoScreen({
  estado,
  onReintentar,
}: {
  estado: Extract<Estado, { etapa: "resultado" }>
  onReintentar: () => void
}) {
  const { tema, preguntas, elegidas, resultado } = estado
  const correctas = elegidas.filter((e, i) => e === preguntas[i].correcta).length
  const total = preguntas.length
  const puntaje = correctas * 10
  const { racha_actual, puntos_totales, respuesta_neville } = resultado
  const allSources = respuesta_neville
    ? [
        ...(respuesta_neville.librosCitados ?? []),
        ...(respuesta_neville.conferenciasCitadas ?? []),
      ]
    : []
  const hasSaved = React.useRef(false)
  React.useEffect(() => {
    if (hasSaved.current) return
    hasSaved.current = true

    const respuestaNeville = respuesta_neville ? respuesta_neville.body : ""
    fetch("/api/memoria", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contenido: `Evaluación sobre "${tema}" — Puntaje: ${correctas}/${total}${respuestaNeville ? `\n\n${respuestaNeville}` : ""}`,
        origenTipo: "evaluacion",
        origenMeta: { tema, correctas, total, puntaje },
        source: `Ponerme a prueba — ${tema}`,
      }),
    }).catch(() => {})
  }, [tema, correctas, total, puntaje, respuesta_neville])

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-4">
      <div className="space-y-2 text-center">
        <p className="text-5xl font-bold tabular-nums">{puntaje}</p>
        <p className="text-lg text-muted-foreground">puntos</p>
        <p className="text-sm text-muted-foreground">
          {correctas} de {total} correctas
        </p>
        <p className="mt-3 font-medium">{performanceMsg(correctas, total, tema)}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Flame className="h-4 w-4 text-orange-500" />
              Racha
            </p>
            <CardTitle className="text-2xl">
              {racha_actual} día{racha_actual !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Puntos totales</p>
            <CardTitle className="text-2xl">{puntos_totales}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {respuesta_neville && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold">Lo que dice Neville sobre este tema</h3>
            <Badge variant="secondary" className="text-xs">
              Guardado en tu Memoria
            </Badge>
          </div>
          <div className="rounded-lg border p-5 space-y-4">
            {respuesta_neville.pregunta_original && (
              <p className="italic text-sm text-muted-foreground">
                "{respuesta_neville.pregunta_original}"
              </p>
            )}
            <article className="space-y-3 text-sm leading-relaxed">
              {formatBodyParagraphs(respuesta_neville.body).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </article>
            {allSources.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {allSources.map((s) => (
                  <Badge key={s} variant="outline" className="text-xs">
                    {s}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Button onClick={onReintentar} size="lg">
        Elegir otro tema
      </Button>
    </div>
  )
}

function HistorialTab() {
  const [evaluaciones, setEvaluaciones] = React.useState<EvaluacionHistorial[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch("/api/preguntas/historial")
      .then((r) => r.json())
      .then((d: { evaluaciones?: EvaluacionHistorial[] }) => {
        setEvaluaciones(d.evaluaciones ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (evaluaciones.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Todavía no hiciste ninguna evaluación.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {evaluaciones.map((ev) => (
        <div
          key={ev.id}
          className="flex items-center justify-between rounded-lg border px-4 py-3"
        >
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{ev.tema}</p>
            <p className="text-xs text-muted-foreground">
              {ev.respuestas_correctas}/{ev.total_preguntas} correctas
            </p>
          </div>
          <div className="space-y-0.5 text-right">
            <p className="font-semibold">{ev.puntaje} pts</p>
            <p className="text-xs text-muted-foreground">
              {new Date(ev.created_at).toLocaleDateString("es-AR", {
                day: "numeric",
                month: "short",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function PreguntasView() {
  const [estado, setEstado] = React.useState<Estado>({
    etapa: "setup",
    racha: 0,
    puntosTotal: 0,
  })
  const [initialTema, setInitialTema] = React.useState("")

  React.useEffect(() => {
    const raw = sessionStorage.getItem("odiseo_reutilizar")
    if (raw) {
      try {
        const { content } = JSON.parse(raw) as { content: string }
        sessionStorage.removeItem("odiseo_reutilizar")
        setInitialTema(content.slice(0, 150))
      } catch {}
    }
  }, [])

  React.useEffect(() => {
    fetch("/api/rachas")
      .then((r) => r.json())
      .then((d: { racha_actual?: number; puntos_totales?: number }) => {
        setEstado((prev) =>
          prev.etapa === "setup"
            ? { ...prev, racha: d.racha_actual ?? 0, puntosTotal: d.puntos_totales ?? 0 }
            : prev
        )
      })
      .catch(() => {})
  }, [])

  async function handleStart(tema: string, cantidad: number, tipo: TipoPregunta) {
    setEstado({ etapa: "generando", tema, cantidad, tipo })

    try {
      const res = await fetch("/api/preguntas/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema, cantidad, tipo }),
      })
      const data = (await res.json()) as { preguntas?: Pregunta[]; error?: string }

      if (!res.ok || !data.preguntas) {
        setEstado({
          etapa: "error",
          mensaje: data.error ?? "No se pudieron generar las preguntas.",
          tema,
          cantidad,
          tipo,
        })
        return
      }

      setEstado({
        etapa: "evaluando",
        preguntas: data.preguntas,
        tema,
        tipo,
        indice: 0,
        elegidas: new Array<null>(data.preguntas.length).fill(null),
        mostrandoFeedback: false,
      })
    } catch {
      setEstado({
        etapa: "error",
        mensaje: "No se pudieron generar las preguntas. Intentá de nuevo.",
        tema,
        cantidad,
        tipo,
      })
    }
  }

  function handleElegir(opcion: Opcion) {
    if (estado.etapa !== "evaluando" || estado.mostrandoFeedback) return
    const nuevasElegidas = [...estado.elegidas]
    nuevasElegidas[estado.indice] = opcion
    setEstado({ ...estado, elegidas: nuevasElegidas, mostrandoFeedback: true })
  }

  function handleSiguiente() {
    if (estado.etapa !== "evaluando") return
    setEstado({ ...estado, indice: estado.indice + 1, mostrandoFeedback: false })
  }

  async function handleVerResultado() {
    if (estado.etapa !== "evaluando") return
    const { preguntas, tema, elegidas, tipo } = estado
    const finales = elegidas as Opcion[]
    const correctas = finales.filter((e, i) => e === preguntas[i].correcta).length

    setEstado({ etapa: "enviando", preguntas, tema, elegidas: finales, tipo })

    try {
      const res = await fetch("/api/preguntas/resultado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tema,
          totalPreguntas: preguntas.length,
          respuestasCorrectas: correctas,
          puntaje: correctas * 10,
        }),
      })
      const resultado = (await res.json()) as ResultadoAPI

      if (resultado.hito && HITO_MSGS[resultado.hito]) {
        toast(HITO_MSGS[resultado.hito], { duration: 5000 })
      }

      setEstado({ etapa: "resultado", tema, preguntas, elegidas: finales, resultado, tipo })
    } catch {
      setEstado({
        etapa: "resultado",
        tema,
        preguntas,
        elegidas: finales,
        tipo,
        resultado: {
          racha_actual: 0,
          racha_maxima: 0,
          puntos_totales: 0,
          hito: null,
          respuesta_neville: null,
        },
      })
    }
  }

  function handleReintentar() {
    setEstado({ etapa: "setup", racha: 0, puntosTotal: 0 })
    fetch("/api/rachas")
      .then((r) => r.json())
      .then((d: { racha_actual?: number; puntos_totales?: number }) => {
        setEstado({ etapa: "setup", racha: d.racha_actual ?? 0, puntosTotal: d.puntos_totales ?? 0 })
      })
      .catch(() => {})
  }

  return (
    <Tabs defaultValue="evaluar">
      <TabsList className="mb-6">
        <TabsTrigger value="evaluar">Evaluar</TabsTrigger>
        <TabsTrigger value="historial">Historial</TabsTrigger>
      </TabsList>

      <TabsContent value="evaluar">
        {estado.etapa === "setup" && (
          <SetupScreen estado={estado} onStart={handleStart} initialTema={initialTema} />
        )}

        {(estado.etapa === "generando" || estado.etapa === "enviando") && (
          <div className="flex flex-col items-center gap-4 py-20">
            <Loader2 className="h-9 w-9 animate-spin" style={{ color: "#E8401A" }} />
            <div className="text-center space-y-1">
              <p className="font-medium">
                {estado.etapa === "generando"
                  ? `Preparando tu evaluación sobre ${estado.tema}`
                  : "Calculando resultado"}
              </p>
              <p className="text-sm text-muted-foreground">Esto puede tardar unos segundos…</p>
            </div>
          </div>
        )}

        {estado.etapa === "error" && (
          <div className="mx-auto max-w-md space-y-4 py-12 text-center">
            <p className="text-destructive font-medium">Hubo un error al generar las preguntas.</p>
            <p className="text-sm text-muted-foreground">{estado.mensaje}</p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => handleStart(estado.tema, estado.cantidad, estado.tipo)}>
                Intentar de nuevo
              </Button>
              <Button
                variant="ghost"
                onClick={() => setEstado({ etapa: "setup", racha: 0, puntosTotal: 0 })}
              >
                Elegir otro tema
              </Button>
            </div>
          </div>
        )}

        {estado.etapa === "evaluando" && (
          <EvaluandoScreen
            estado={estado}
            onElegir={handleElegir}
            onSiguiente={handleSiguiente}
            onVerResultado={handleVerResultado}
          />
        )}

        {estado.etapa === "resultado" && (
          <ResultadoScreen estado={estado} onReintentar={handleReintentar} />
        )}
      </TabsContent>

      <TabsContent value="historial">
        <HistorialTab />
      </TabsContent>
    </Tabs>
  )
}
