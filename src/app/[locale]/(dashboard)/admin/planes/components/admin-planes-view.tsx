"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface Solicitud {
  id: string
  nombre: string
  edad: number | null
  pais_ciudad: string | null
  estado_civil: string | null
  tiene_hijos: boolean
  cantidad_hijos: number | null
  trabaja: boolean
  ocupacion: string | null
  created_at: string
  duracion_dias: number
  conoce_neville: string | null
  status: string
  deseo: string
  mensaje_extra: string | null
  respuesta: string | null
}

export function AdminPlanesView({ solicitudes }: { solicitudes: Solicitud[] }) {
  const [respuestas, setRespuestas] = useState<Record<string, string>>({})
  const [enviando, setEnviando] = useState<string | null>(null)

  const responder = async (id: string) => {
    const respuesta = respuestas[id]
    if (!respuesta?.trim()) return
    setEnviando(id)

    try {
      const res = await fetch(`/api/planes/${id}/responder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respuesta }),
      })
      if (res.ok) {
        window.location.reload()
      } else {
        alert("Hubo un error al responder.")
      }
    } catch (err) {
      console.error(err)
      alert("Hubo un error de red.")
    } finally {
      setEnviando(null)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Solicitudes de plan</h1>
      <p className="text-muted-foreground">{solicitudes.length} solicitudes en total</p>

      <div className="space-y-6">
        {solicitudes.map(sol => (
          <div key={sol.id} className="rounded-xl border bg-card p-5 space-y-4 text-card-foreground">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-lg">{sol.nombre} {sol.edad ? `· ${sol.edad} años` : ""}</p>
                <p className="text-sm text-muted-foreground">
                  {sol.pais_ciudad || "Sin ciudad/país"}{sol.estado_civil ? ` · ${sol.estado_civil}` : ""}
                  {sol.tiene_hijos ? ` · ${sol.cantidad_hijos || 0} hijo/s` : " · Sin hijos"}
                  {sol.trabaja ? ` · ${sol.ocupacion || "Trabaja"}` : " · No trabaja"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(sol.created_at), { addSuffix: true, locale: es })}
                  {" · "}{sol.duracion_dias} días{sol.conoce_neville ? ` · ${sol.conoce_neville}` : ""}
                </p>
              </div>
              <span 
                className={`text-xs font-semibold rounded-full px-2.5 py-1 ${
                  sol.status === "respondido" || sol.status === "leido"
                    ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                    : "text-white"
                }`}
                style={!(sol.status === "respondido" || sol.status === "leido") ? { backgroundColor: "#E8401A" } : {}}
              >
                {sol.status}
              </span>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">DESEO</p>
              <p className="text-sm whitespace-pre-wrap">{sol.deseo}</p>
            </div>

            {sol.mensaje_extra && (
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">MENSAJE EXTRA</p>
                <p className="text-sm whitespace-pre-wrap">{sol.mensaje_extra}</p>
              </div>
            )}

            {sol.respuesta ? (
              <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-4 border border-green-100 dark:border-green-900/30">
                <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">TU RESPUESTA</p>
                <p className="text-sm whitespace-pre-wrap">{sol.respuesta}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Textarea
                  value={respuestas[sol.id] ?? ""}
                  onChange={e => setRespuestas(prev => ({ ...prev, [sol.id]: e.target.value }))}
                  placeholder="Escribí el plan personalizado para esta persona..."
                  className="min-h-[150px] resize-none text-sm leading-relaxed"
                />
                <Button
                  onClick={() => responder(sol.id)}
                  disabled={enviando === sol.id || !respuestas[sol.id]?.trim()}
                  className="text-white cursor-pointer"
                  style={{ backgroundColor: "#E8401A" }}
                >
                  {enviando === sol.id ? "Enviando..." : "Enviar respuesta"}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
