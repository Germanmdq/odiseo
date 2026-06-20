"use client"

import { Share2 } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UsarEnButtonProps {
  content: string
  origen: string
}

export function UsarEnButton({ content, origen }: UsarEnButtonProps) {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) ?? "es"

  const destinos = [
    { label: "Coach", path: `/${locale}/coach`, autor: null },
    { label: "Ponerme a prueba", path: `/${locale}/preguntas`, autor: null },
    { label: "Mi libro", path: `/${locale}/mi-libro`, autor: null },
  ]

  const handleUsar = (path: string, autor: string | null) => {
    sessionStorage.setItem("odiseo_contexto", JSON.stringify({ content, origen }))
    const url = autor ? `${path}?autor=${autor}&desde=${origen}` : `${path}?desde=${origen}`
    router.push(url)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Share2 className="size-3.5" />
          <span className="sr-only">Usar en otra herramienta</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <p className="px-2 py-1.5 text-xs text-muted-foreground font-medium">
          Usar en…
        </p>
        {destinos.map((d) => (
          <DropdownMenuItem
            key={`${d.path}-${d.autor}`}
            onClick={() => handleUsar(d.path, d.autor)}
          >
            {d.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
