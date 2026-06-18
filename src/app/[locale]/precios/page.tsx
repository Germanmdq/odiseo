import { PreciosOdiseo } from "@/components/precios-odiseo"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

export default async function PreciosPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b flex justify-between items-center max-w-7xl mx-auto w-full">
        <Link href={`/${locale}`} className="flex items-center gap-2.5">
          <Image
            src="/logo-odiseo.png"
            alt="Odiseo"
            width={36}
            height={36}
            className="rounded-full"
          />
          <span className="font-bold tracking-wide text-lg text-foreground">Odiseo</span>
        </Link>
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Volver al Dashboard
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 max-w-6xl mx-auto w-full space-y-8">
        <div className="text-center max-w-lg space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Planes Odiseo
          </h1>
          <p className="text-muted-foreground text-sm">
            Elegí el plan que mejor se adapte a vos. Cancelás cuando querés. 
            El plan anual te da acceso exclusivo a los talleres de Germán y Taty.
          </p>
        </div>

        <div className="w-full">
          <PreciosOdiseo />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t text-center text-xs text-muted-foreground w-full">
        © {new Date().getFullYear()} Odiseo. Todos los derechos reservados.
      </footer>
    </div>
  )
}
