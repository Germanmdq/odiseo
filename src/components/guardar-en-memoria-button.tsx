"use client"

import { Bookmark, BookmarkCheck } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"

type SaveState = "idle" | "saving" | "saved" | "error"

type Props = {
  contenido: string
  origenTipo: string
  origenMeta?: Record<string, unknown>
  source: string
  className?: string
}

export function GuardarEnMemoriaButton({
  contenido,
  origenTipo,
  origenMeta,
  source,
  className,
}: Props) {
  const [state, setState] = useState<SaveState>("idle")
  const [errorMessage, setErrorMessage] = useState("")

  async function handleSave() {
    if (state !== "idle") return
    setState("saving")
    setErrorMessage("")

    const isShortType = origenTipo === "fuente" || origenTipo === "biblia" || origenTipo === "testimonios"
    const extracto = isShortType && contenido.length > 300
      ? contenido.slice(0, 300).trimEnd() + "..."
      : contenido

    try {
      const res = await fetch("/api/memoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenido: extracto, origenTipo, origenMeta, source }),
      })
      const payload = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) {
        const message = payload?.error ?? "No se pudo guardar en Memoria"
        console.error("Guardar en Memoria failed", payload)
        throw new Error(message)
      }
      setState("saved")
      setTimeout(() => setState("idle"), 3000)
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar en Memoria"
      setErrorMessage(message)
      setState("error")
      setTimeout(() => setState("idle"), 2000)
    }
  }

  const isSaved = state === "saved"
  const Icon = isSaved ? BookmarkCheck : Bookmark

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={state === "saving" || state === "saved"}
      title={state === "error" ? errorMessage : isSaved ? "Guardado en Memoria" : "Guardar en Memoria"}
      className={cn(
        "rounded p-1 transition-all hover:bg-black/10 dark:hover:bg-white/10",
        "opacity-0 group-hover:opacity-100 focus:opacity-100",
        isSaved && "!opacity-100 text-primary",
        state === "error" && "!opacity-100 text-destructive",
        state === "saving" && "!opacity-100 animate-pulse",
        className
      )}
    >
      <Icon className="size-3.5" />
    </button>
  )
}
