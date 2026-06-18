import { createClient } from "@/lib/supabase/server"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Brain,
  MessageSquare,
  User,
} from "lucide-react"
import { OdiseoHubCard } from "@/components/odiseo-hub-card"

function getSaludo(hour: number): string {
  if (hour >= 6 && hour < 12) return "Buenos días"
  if (hour >= 12 && hour < 19) return "Buenas tardes"
  return "Buenas noches"
}

const CARDS = [
  {
    title: "Conversar",
    desc: "Coach, Creador de escenas y Ponerme a prueba",
    href: "/conversar",
    icon: MessageSquare,
    image: "/dashboard/conversar.jpg",
    kicker: "Coach",
  },
  {
    title: "Mi espacio",
    desc: "Diario, Mensajes, Notas, Planes y más",
    href: "/mi-espacio",
    icon: User,
    image: "/dashboard/mi-espacio.jpg",
    kicker: "Mi espacio",
  },
  {
    title: "Estudio",
    desc: "Fuentes, Testimonios, Biblia y Talleres",
    href: "/estudio",
    icon: BookOpen,
    image: "/dashboard/estudio.jpg",
    kicker: "Biblioteca",
  },
  {
    title: "Yo",
    desc: "Memoria y Perfil",
    href: "/yo",
    icon: Brain,
    image: "/dashboard/yo.jpg",
    kicker: "Memoria",
  },
]

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let nombre = ""

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nombre_preferido, display_name, full_name")
      .eq("id", user.id)
      .maybeSingle()

    nombre =
      profile?.nombre_preferido ||
      profile?.display_name ||
      profile?.full_name ||
      user.user_metadata?.nombre_preferido ||
      ""
  }

  const hourAR = (new Date().getUTCHours() - 3 + 24) % 24
  const saludo = getSaludo(hourAR)

  return (
    <div className="relative mx-auto grid min-h-[calc(100vh-6.5rem)] w-full max-w-7xl grid-rows-[auto_1fr] gap-4 overflow-hidden px-4 pb-4 lg:px-6">
      {/* Hero */}
      <section className="relative min-h-[190px] overflow-hidden rounded-[20px] bg-[#F4F4F4] shadow-[0_4px_6px_rgba(0,0,0,0.07),0_10px_15px_rgba(0,0,0,0.1),0_20px_40px_rgba(0,0,0,0.08)] p-5 sm:min-h-[210px] sm:p-6 lg:min-h-[230px] lg:p-7">
        {/* Background */}
        <div className="absolute inset-0 bg-black" />

        <div className="relative max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-white bg-black px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            <span className="size-2 rounded-full bg-[#FF2B0A]" />
            Inicio
          </div>

          <h1 className="max-w-xl text-3xl font-bold tracking-[-0.045em] text-white text-balance sm:text-4xl lg:text-5xl">
            {saludo}{nombre ? `, ${nombre}` : ""}.
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
            Entrá a conversar, estudiar, registrar tu conocimiento o seguir creando desde las herramientas que ya tenés en Odiseo.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${locale}/conversar`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border-2 border-white bg-white px-5 text-sm font-semibold text-black transition hover:bg-[#FF2B0A] hover:border-[#FF2B0A] hover:text-white"
            >
              Comenzar práctica
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href={`/${locale}/estudio`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border-2 border-white/60 px-5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              Explorar estudio
            </Link>
          </div>
        </div>
      </section>

      <section className="grid min-h-0 grid-cols-1 gap-4 md:grid-cols-2">
        {CARDS.map((card) => (
          <OdiseoHubCard
            key={card.href}
            href={`/${locale}${card.href}`}
            title={card.title}
            desc={card.desc}
            icon={card.icon}
            image={card.image}
            kicker={card.kicker}
            compact
            priority
          />
        ))}
      </section>
    </div>
  )
}
