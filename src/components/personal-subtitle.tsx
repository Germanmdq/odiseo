"use client"

import { useNombrePreferido } from "@/hooks/use-nombre-preferido"

/**
 * Subtítulo de sección personalizado con el nombre del usuario.
 * `conNombre` usa el token {nombre}; `sinNombre` es la red de seguridad
 * neutral para el margen breve en que el nombre todavía no propagó.
 */
export function PersonalSubtitle({
  conNombre,
  sinNombre,
  className = "text-muted-foreground",
}: {
  conNombre: string
  sinNombre: string
  className?: string
}) {
  const nombre = useNombrePreferido()
  const text = nombre ? conNombre.replace("{nombre}", nombre) : sinNombre
  return <p className={className}>{text}</p>
}
