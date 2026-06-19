"use client"

import { useState } from "react"
import Link from "next/link"
import { ClipboardList, CheckCircle, Clock, Calendar, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PlanSolicitud {
  id: string
  nombre: string
  deseo: string
  edad?: number | null
  pais_ciudad?: string | null
  trabaja?: boolean | null
  ocupacion?: string | null
  estado_civil?: string | null
  tiene_hijos?: boolean | null
  cantidad_hijos?: number | null
  conoce_neville?: string | null
  hora_despertar?: string | null
  hora_dormir?: string | null
  duracion_dias: number
  mensaje_extra?: string | null
  status: "pendiente" | "respondido"
  respuesta?: string | null
  respondido_at?: string | null
  created_at: string
}

interface MensajesViewProps {
  planes: PlanSolicitud[]
  pendientes: PlanSolicitud[]
  locale: string
}

export function MensajesView({ planes, pendientes, locale }: MensajesViewProps) {
  const todos = [...planes, ...pendientes].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const [seleccionado, setSeleccionado] = useState<PlanSolicitud | null>(
    todos[0] ?? null
  )
  const [vistaDetalle, setVistaDetalle] = useState(false)

  const handleSelect = (plan: PlanSolicitud) => {
    setSeleccionado(plan)
    setVistaDetalle(true)
  }

  if (planes.length === 0 && pendientes.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-2xl border bg-card p-8 shadow-sm space-y-6 flex flex-col items-center">
          <div className="rounded-full bg-orange-100 p-4 dark:bg-orange-950/20">
            <ClipboardList className="size-10 text-[#E8401A]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Tu bandeja de planes está vacía</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Lecturas, ejercicios, imaginación nocturna y afirmaciones. Germán te guía.
            </p>
          </div>
          <Button asChild className="w-full text-white font-medium cursor-pointer" style={{ backgroundColor: "#E8401A" }}>
            <Link href={`/${locale}/planes`}>
              Pedir mi primer plan
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] h-[calc(100dvh-var(--header-height)-2rem)] overflow-hidden rounded-xl border bg-card shadow-md mx-4">
      
      {/* Columna izquierda — lista */}
      <div className={cn(
        "flex flex-col border-r bg-muted/10",
        vistaDetalle ? "hidden md:flex" : "flex"
      )}>
        {/* Header naranja */}
        <div className="shrink-0 px-4 py-4" style={{ backgroundColor: "#E8401A" }}>
          <h1 className="font-semibold text-white text-lg">Mensajes</h1>
          <p className="text-white/70 text-xs mt-0.5">{todos.length} solicitudes</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {todos.map(plan => (
            <button
              key={plan.id}
              onClick={() => handleSelect(plan)}
              className={cn(
                "w-full text-left px-4 py-3 border-b hover:bg-muted/50 transition-colors",
                seleccionado?.id === plan.id ? "bg-muted" : ""
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    {plan.status === "respondido"
                      ? <CheckCircle className="size-3 text-green-500 shrink-0" />
                      : <Clock className="size-3 shrink-0" style={{ color: "#E8401A" }} />
                    }
                    <span className="text-xs text-muted-foreground">
                      {plan.status === "respondido" ? "Respondido" : "Pendiente"}
                    </span>
                  </div>
                  <p className="text-sm font-medium line-clamp-2 leading-snug">
                    {plan.deseo}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(plan.created_at), { addSuffix: true, locale: es })}
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Columna derecha — detalle */}
      <div className={cn(
        "flex flex-col overflow-y-auto",
        vistaDetalle ? "flex" : "hidden md:flex"
      )}>
        {/* Botón volver en mobile */}
        {vistaDetalle && (
          <button
            onClick={() => setVistaDetalle(false)}
            className="flex items-center gap-1.5 px-4 py-3 text-sm text-primary border-b md:hidden"
          >
            <ChevronLeft className="size-4" />
            Volver
          </button>
        )}

        {seleccionado ? (
          <div className="p-6 space-y-6 max-w-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {seleccionado.status === "respondido"
                  ? <CheckCircle className="size-4 text-green-500" />
                  : <Clock className="size-4" style={{ color: "#E8401A" }} />
                }
                <span className="text-sm font-medium">
                  {seleccionado.status === "respondido" ? "Plan respondido" : "Esperando respuesta"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(seleccionado.created_at), { addSuffix: true, locale: es })}
              </span>
            </div>

            <div className="rounded-xl border bg-muted/30 p-5 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tu solicitud</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{seleccionado.deseo}</p>
              
              {/* Detalles adicionales del plan si existen */}
              {(seleccionado.duracion_dias || seleccionado.hora_despertar || seleccionado.hora_dormir) && (
                <div className="pt-3 border-t grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium block text-foreground">Duración del plan</span>
                    {seleccionado.duracion_dias} días
                  </div>
                  {seleccionado.hora_despertar && (
                    <div>
                      <span className="font-medium block text-foreground">Horario Despertar</span>
                      {seleccionado.hora_despertar}
                    </div>
                  )}
                  {seleccionado.hora_dormir && (
                    <div>
                      <span className="font-medium block text-foreground">Horario Dormir</span>
                      {seleccionado.hora_dormir}
                    </div>
                  )}
                </div>
              )}
            </div>

            {seleccionado.respuesta ? (
              <div className="rounded-xl border p-5 space-y-2" style={{ borderColor: "#E8401A33" }}>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#E8401A" }}>
                  Respuesta de Germán
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{seleccionado.respuesta}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-6 text-center">
                <Clock className="size-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Germán todavía no respondió esta solicitud.</p>
                <p className="text-xs text-muted-foreground mt-1">Generalmente responde en 24-48 horas.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">Seleccioná una solicitud</p>
          </div>
        )}
      </div>
    </div>
  )
}
