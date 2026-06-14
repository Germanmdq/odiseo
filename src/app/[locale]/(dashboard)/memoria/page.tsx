import { Brain } from "lucide-react"

import { MemoriaView } from "./components/memoria-view"

export default function MemoriaPage() {
  return (
    <div className="flex-1 space-y-6 px-4 md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Brain className="size-4" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Memoria</h1>
          <p className="text-muted-foreground text-sm">
            Lo que fuiste guardando de tus sesiones
          </p>
        </div>
      </div>
      <MemoriaView />
    </div>
  )
}
