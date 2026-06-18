"use client"

import { Share2 } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ReutilizarEnButtonProps {
  content: string
  origen: string
}

export function ReutilizarEnButton({ content, origen }: ReutilizarEnButtonProps) {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) ?? "es"

  const destinos = [
    { label: "Coach — Neville Goddard", path: `/${locale}/coach`, autor: "neville" },
    { label: "Coach — Joseph Murphy", path: `/${locale}/coach`, autor: "murphy" },
    { label: "Coach — Emmet Fox", path: `/${locale}/coach`, autor: "fox" },
    { label: "Coach — Florence Scovel Shinn", path: `/${locale}/coach`, autor: "scovel-shinn" },
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
