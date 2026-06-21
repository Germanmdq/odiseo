"use client"

import * as React from "react"
import { Share2, Bookmark } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface GuardarEnMemoriaConfig {
  origenTipo: string
  source: string
  origenMeta?: Record<string, unknown>
}

interface ReutilizarEnButtonProps {
  content: string
  origen: string
  // Si se provee, agrega "Guardar en Memoria" como una opción más del menú.
  guardarEnMemoria?: GuardarEnMemoriaConfig
}

export function ReutilizarEnButton({ content, origen, guardarEnMemoria }: ReutilizarEnButtonProps) {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) ?? "es"

  const [guardando, setGuardando] = React.useState(false)

  const destinos = [
    { label: "Coach", path: `/${locale}/coach`, autor: null },
    { label: "Creador de escenas", path: `/${locale}/creador-de-escenas`, autor: null },
    { label: "Ponerme a prueba", path: `/${locale}/preguntas`, autor: null },
    { label: "Mi libro", path: `/${locale}/mi-libro`, autor: null },
    { label: "Diario", path: `/${locale}/diario`, autor: null },
    { label: "Notas", path: `/${locale}/notas`, autor: null },
  ]

  const handleUsar = (path: string, autor: string | null) => {
    sessionStorage.setItem("odiseo_reutilizar", JSON.stringify({ content, origen }))
    const url = autor
      ? `${path}?autor=${autor}&desde=externo`
      : `${path}?desde=externo`
    router.push(url)
  }

  async function handleGuardarMemoria() {
    if (!guardarEnMemoria || guardando) return
    setGuardando(true)
    const isShort = ["fuente", "biblia", "testimonios"].includes(guardarEnMemoria.origenTipo)
    const extracto = isShort && content.length > 300 ? content.slice(0, 300).trimEnd() + "..." : content
    try {
      const res = await fetch("/api/memoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contenido: extracto,
          origenTipo: guardarEnMemoria.origenTipo,
          origenMeta: guardarEnMemoria.origenMeta,
          source: guardarEnMemoria.source,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success("Guardado en Memoria")
    } catch {
      toast.error("No se pudo guardar en Memoria")
    } finally {
      setGuardando(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 active:opacity-75"
          style={{ backgroundColor: "#E8401A" }}
        >
          <Share2 className="size-3.5" />
          Reutilizar en...
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <p className="px-2 py-1.5 text-xs text-muted-foreground font-medium">
          Llevar este contenido a…
        </p>
        {destinos.map((d) => (
          <DropdownMenuItem
            key={`${d.path}-${d.autor ?? "direct"}`}
            onClick={() => handleUsar(d.path, d.autor)}
          >
            {d.label}
          </DropdownMenuItem>
        ))}
        {guardarEnMemoria && (
          <DropdownMenuItem onClick={handleGuardarMemoria} disabled={guardando}>
            <Bookmark className="size-4" />
            {guardando ? "Guardando..." : "Guardar en Memoria"}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
