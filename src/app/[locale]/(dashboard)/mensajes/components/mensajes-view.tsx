"use client"

import { useState } from "react"
import Link from "next/link"
import { ClipboardList, CheckCircle, Clock, Calendar, ArrowRight, Sparkles } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"

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
  const allItems = [...planes, ...pendientes].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const [selectedId, setSelectedId] = useState<string>(allItems[0]?.id ?? "")
  const selectedItem = allItems.find(item => item.id === selectedId) || allItems[0]

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
              Pedí tu plan de práctica personalizado y Germán preparará una guía de ejercicios exclusiva para vos.
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
    <div className="mx-auto w-full max-w-6xl px-4 py-8 h-[calc(100dvh-var(--header-height)-4rem)] flex flex-col">
      {/* Contenedor principal con sombra */}
      <div className="flex flex-1 rounded-2xl border bg-card shadow-md overflow-hidden min-h-[500px]">
        {/* Columna Izquierda: Lista de solicitudes (280px fijo) */}
        <div className="w-[280px] shrink-0 border-r flex flex-col bg-muted/10">
          <div className="p-4 border-b bg-muted/20">
            <h2 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Mis Solicitudes</h2>
          </div>
          <div className="flex-1 overflow-y-auto divide-y">
            {allItems.map(item => {
              const isSelected = item.id === selectedId
              const dateObj = new Date(item.created_at)
              const timeAgo = isFinite(dateObj.getTime())
                ? formatDistanceToNow(dateObj, { addSuffix: true, locale: es })
                : ""
              
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left p-4 transition-colors flex flex-col gap-1.5 border-l-4 ${
                    isSelected
                      ? "bg-orange-50/50 border-[#E8401A] dark:bg-orange-950/10"
                      : "border-transparent hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-sm text-foreground truncate max-w-[150px]">
                      Plan de {item.nombre}
                    </span>
                    <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 shrink-0 ${
                      item.status === "respondido"
                        ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
                    }`}>
                      {item.status === "respondido" ? "Listo" : "Pendiente"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {item.deseo}
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {timeAgo}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Columna Derecha: Detalle de la solicitud seleccionada */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          {selectedItem ? (
            <div className="flex flex-col h-full">
              {/* Header de la solicitud */}
              <div className="px-6 py-4 border-b flex items-center justify-between bg-muted/5">
                <div>
                  <h3 className="font-semibold text-lg text-foreground">
                    Solicitud de Plan: {selectedItem.nombre}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Pedida {formatDistanceToNow(new Date(selectedItem.created_at), { addSuffix: true, locale: es })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedItem.status === "respondido" ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full dark:bg-green-950/20 dark:text-green-400">
                      <CheckCircle className="size-3.5" />
                      Plan Preparado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full dark:bg-amber-950/20 dark:text-amber-400">
                      <Clock className="size-3.5" />
                      En Preparación
                    </span>
                  )}
                </div>
              </div>

              {/* Contenido detail scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Bloque del Deseo original */}
                <div className="rounded-xl border bg-muted/20 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Sparkles className="size-4 text-[#E8401A]" />
                    Deseo / Objetivo Planteado
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {selectedItem.deseo}
                  </p>
                  
                  {/* Detalles adicionales del plan si existen */}
                  <div className="pt-3 border-t grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium block text-foreground">Duración del plan</span>
                      {selectedItem.duracion_dias} días
                    </div>
                    {selectedItem.hora_despertar && (
                      <div>
                        <span className="font-medium block text-foreground">Horario Despertar</span>
                        {selectedItem.hora_despertar}
                      </div>
                    )}
                    {selectedItem.hora_dormir && (
                      <div>
                        <span className="font-medium block text-foreground">Horario Dormir</span>
                        {selectedItem.hora_dormir}
                      </div>
                    )}
                  </div>
                </div>

                {/* Respuesta de Germán */}
                {selectedItem.status === "respondido" && selectedItem.respuesta ? (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-md text-foreground flex items-center gap-2">
                      <span className="size-2 rounded-full bg-[#E8401A]" />
                      Tu Plan de Práctica Diario
                    </h4>
                    <div className="rounded-xl border bg-card p-6 shadow-sm border-l-4 border-l-[#E8401A] space-y-4">
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {selectedItem.respuesta}
                      </p>
                      <div className="pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground bg-muted/5 -mx-6 -mb-6 p-6 rounded-b-xl">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="size-3.5" />
                          Respondido {selectedItem.respondido_at ? formatDistanceToNow(new Date(selectedItem.respondido_at), { addSuffix: true, locale: es }) : ""}
                        </span>
                        <span className="font-medium text-[#E8401A]">
                          Hacé tus ejercicios diariamente al despertar y antes de dormir.
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed p-8 text-center space-y-4 max-w-md mx-auto my-8">
                    <div className="size-12 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center mx-auto">
                      <Clock className="size-6 text-amber-500" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground">Germán está preparando tu plan</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Evaluamos detalladamente tus horarios, hábitos y deseo para preparar ejercicios a tu medida. Te enviaremos un email cuando tu plan personalizado esté listo.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <p className="text-muted-foreground text-sm">
                Seleccioná una solicitud de la lista para ver los detalles.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
