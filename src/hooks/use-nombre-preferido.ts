"use client"

import { useEffect, useState } from "react"

// Cache a nivel de módulo para no repetir el fetch en cada sección durante
// la misma sesión. Solo se cachean nombres reales (no vacíos): si el nombre
// todavía no propagó, se vuelve a intentar en el próximo montaje, de modo que
// el "fallback sin nombre" nunca quede pegado de forma permanente.
let cachedNombre: string | null = null
let inflight: Promise<string> | null = null

function fetchNombre(): Promise<string> {
  if (cachedNombre) return Promise.resolve(cachedNombre)
  if (!inflight) {
    inflight = fetch("/api/perfil", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { nombrePreferido?: string }) => {
        const n = (d.nombrePreferido ?? "").trim()
        if (n) cachedNombre = n
        return n
      })
      .catch(() => "")
      .finally(() => {
        inflight = null
      })
  }
  return inflight
}

/**
 * Devuelve el nombre preferido del usuario para personalizar la UI.
 * Vacío ("") solo en el margen entre registro y propagación del nombre.
 */
export function useNombrePreferido(): string {
  const [nombre, setNombre] = useState<string>(cachedNombre ?? "")

  useEffect(() => {
    let active = true
    void fetchNombre().then((n) => {
      if (active && n) setNombre(n)
    })
    return () => {
      active = false
    }
  }, [])

  return nombre
}
