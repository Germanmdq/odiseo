"use client"

import { useState } from "react"
import { Share2, Bookmark, BookmarkCheck } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SaveState = "idle" | "saving" | "saved" | "error"

interface Props {
  contenido: string
  titulo?: string
  fuenteId?: string
  origen?: string
  className?: string
  size?: "sm" | "xs"
  variante?: "completo" | "coach"
  label?: string
}

export function CompartirEn({ contenido, titulo, fuenteId, origen = "compartir", className, size = "sm", variante = "completo", label = "Compartir en…" }: Props) {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) ?? "es"
  const [saveState, setSaveState] = useState<SaveState>("idle")

  function navegar(path: string, autor?: string) {
    sessionStorage.setItem(
      "odiseo_reutilizar",
      JSON.stringify({ content: contenido, origen, autor: autor ?? null })
    )
    const url = autor
      ? `/${locale}${path}?autor=${autor}&desde=externo`
      : `/${locale}${path}?desde=externo`
    router.push(url)
  }

  async function handleGuardar() {
    if (saveState !== "idle") return
    setSaveState("saving")
    try {
      const res = await fetch("/api/memoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contenido,
          origenTipo: origen,
          origenMeta: fuenteId ? { fuente_id: fuenteId } : undefined,
          source: titulo ?? origen,
        }),
      })
      if (!res.ok) throw new Error()
      setSaveState("saved")
      setTimeout(() => setSaveState("idle"), 3000)
    } catch {
      setSaveState("error")
      setTimeout(() => setSaveState("idle"), 2000)
    }
  }

  const SaveIcon = saveState === "saved" ? BookmarkCheck : Bookmark
  const btnClass = size === "xs"
    ? "shrink-0 gap-1 h-6 px-2 text-xs"
    : "shrink-0 gap-1.5 h-7 px-2 text-xs"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={`${btnClass} ${className ?? ""}`}>
          <Share2 className="size-3.5" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <p className="px-2 py-1.5 text-xs text-muted-foreground font-medium">Llevar este contenido a…</p>
        {variante === "completo" && (
          <>
            <DropdownMenuItem onClick={() => navegar("/coach", "neville")}>Coach — Neville Goddard</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navegar("/coach", "murphy")}>Coach — Joseph Murphy</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navegar("/coach", "fox")}>Coach — Emmet Fox</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navegar("/coach", "scovel-shinn")}>Coach — Florence Scovel Shinn</DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={() => navegar("/narrador")}>Narrador</DropdownMenuItem>
        <DropdownMenuItem onClick={() => navegar("/creador-de-escenas")}>Creador de escenas</DropdownMenuItem>
        <DropdownMenuItem onClick={() => navegar("/preguntas")}>Ponerme a prueba</DropdownMenuItem>
        {variante === "completo" && (
          <DropdownMenuItem onClick={() => navegar("/mi-libro")}>Mi libro</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleGuardar}
          disabled={saveState === "saving" || saveState === "saved"}
          className="gap-2"
        >
          <SaveIcon className="size-3.5" />
          {saveState === "saved" ? "Guardado en Memoria" : saveState === "saving" ? "Guardando…" : saveState === "error" ? "Error al guardar" : "Guardar en Memoria"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
