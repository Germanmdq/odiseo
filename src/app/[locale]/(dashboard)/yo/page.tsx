import Link from "next/link"
import { ArrowLeft, BrainCircuit, Settings } from "lucide-react"
import { OdiseoHubCard } from "@/components/odiseo-hub-card"

const CARDS = [
  {
    title: "Memoria",
    desc: "Todo lo que fuiste guardando de tus conversaciones, evaluaciones y planes aprobados. El archivo de tu proceso.",
    href: "/memoria",
    icon: BrainCircuit,
    image: "/dashboard/secciones/memoria.jpg",
    kicker: "Memoria",
  },
  {
    title: "Perfil",
    desc: "Tu nombre, email, suscripción, apariencia y notificaciones.",
    href: "/configuracion/perfil",
    icon: Settings,
    image: "/dashboard/secciones/perfil.jpg",
    kicker: "Perfil",
  },
]

export default async function YoPage({
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
        <h1 className="text-3xl font-bold tracking-tight text-black">Yo</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {CARDS.map((card) => {
          const href = card.href.startsWith("/configuracion")
            ? `/${locale}${card.href}`
            : `/${locale}${card.href}`
          return (
            <OdiseoHubCard
              key={card.href}
              href={href}
              title={card.title}
              desc={card.desc}
              icon={card.icon}
              image={card.image}
              kicker={card.kicker}
            />
          )
        })}
      </div>
    </div>
  )
}
