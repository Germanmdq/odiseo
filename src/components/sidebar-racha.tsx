"use client"

import * as React from "react"

export function SidebarRacha() {
  const [racha, setRacha] = React.useState(0)

  React.useEffect(() => {
    fetch("/api/rachas")
      .then((r) => r.json())
      .then((d: { racha_actual?: number }) => setRacha(d.racha_actual ?? 0))
      .catch(() => {})
  }, [])

  if (racha === 0) return null

  const tooltip = `Tu racha actual es de ${racha} día${racha !== 1 ? "s" : ""}. ¡Ponerte a prueba hoy la mantiene viva!`

  return (
    <div
      title={tooltip}
      className="flex cursor-default items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted/50 transition-colors mx-2"
    >
      <span>🔥</span>
      <span className="font-medium">{racha}</span>
      <span className="text-xs">día{racha !== 1 ? "s" : ""}</span>
    </div>
  )
}
