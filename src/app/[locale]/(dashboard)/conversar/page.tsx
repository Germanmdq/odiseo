import Link from "next/link"
import { ArrowLeft, MessageSquare, Sparkles, Target } from "lucide-react"
import { OdiseoHubCard } from "@/components/odiseo-hub-card"

const CARDS = [
  {
    title: "Coach",
    desc: "Conversá con Neville Goddard, Joseph Murphy, Emmet Fox o Florence Scovel Shinn. Cada uno tiene su propio estilo y forma de enseñar.",
    href: "/coach",
    icon: MessageSquare,
    image: "/dashboard/secciones/coach.jpg",
    kicker: "Coach",
  },
  {
    title: "Creador de escenas",
    desc: "Describí con quién estás, en qué lugar y qué clima hay. El Creador construye una escena de 2-3 segundos con todo el detalle sensorial de tu deseo cumplido.",
    href: "/creador-de-escenas",
    icon: Sparkles,
    image: "/dashboard/secciones/creador-de-escenas.jpg",
    kicker: "Escenas",
  },
  {
    title: "Ponerme a prueba",
    desc: "Escribí un tema y elegí cuántas preguntas querés. Al terminar recibís tu puntaje y una respuesta elaborada de Neville relacionada al tema.",
    href: "/preguntas",
    icon: Target,
    image: "/dashboard/secciones/preguntas.jpg",
    kicker: "Práctica",
  },
]

export default async function ConversarPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 lg:px-6">
      <div>
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="size-3.5" />
          Inicio
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-black">Conversar</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {CARDS.map((card) => (
          <OdiseoHubCard
            key={card.href}
            href={`/${locale}${card.href}`}
            title={card.title}
            desc={card.desc}
            icon={card.icon}
            image={card.image}
            kicker={card.kicker}
          />
        ))}
      </div>
    </div>
  )
}
