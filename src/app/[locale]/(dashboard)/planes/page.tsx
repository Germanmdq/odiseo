import { Calendar } from "lucide-react"

export default function PlanesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="mb-6 rounded-full bg-muted p-6">
        <Calendar className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold mb-3">Planes</h1>
      <p className="text-muted-foreground text-lg max-w-md">
        Próximamente — solicitá un plan de práctica personalizado y Germán te responde directamente.
      </p>
    </div>
  )
}
