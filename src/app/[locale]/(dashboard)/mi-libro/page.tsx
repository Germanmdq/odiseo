import { BookOpen } from "lucide-react"

import { MisLibrosView } from "./components/mis-libros-view"

export default function MiLibroPage() {
  return (
    <div className="flex-1 space-y-6 px-4 md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BookOpen className="size-4" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mi libro</h1>
          <p className="text-muted-foreground text-sm">
            Capítulos construidos desde tu conocimiento
          </p>
        </div>
      </div>
      <MisLibrosView />
    </div>
  )
}
