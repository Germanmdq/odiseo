import Link from "next/link"
import {
  ArrowLeft,
  Mail,
  PenLine,
  Calendar,
  StickyNote,
  MessageCircle,
  ClipboardList,
  BookMarked,
} from "lucide-react"
import { OdiseoHubCard } from "@/components/odiseo-hub-card"

const CARDS = [
  {
    title: "Mensajes",
    desc: "Las respuestas de Germán a tus solicitudes de plan personalizado. Cuando tu plan esté listo, te aparece acá para leerlo y aprobarlo.",
    href: "/mensajes",
    icon: Mail,
    image: "/dashboard/secciones/mensajes.jpg",
    kicker: "Mensajes",
  },
  {
    title: "Diario",
    desc: "Tu registro diario de práctica. Escribí lo que imaginaste, sentiste o viviste. Un calendario muestra los días que escribiste.",
    href: "/diario",
    icon: PenLine,
    image: "/dashboard/secciones/diario.jpg",
    kicker: "Diario",
  },
  {
    title: "Mi actividad",
    desc: "Los días que practicaste en Odiseo, tu racha actual y lo que hiciste cada día.",
    href: "/actividad",
    icon: Calendar,
    image: "/dashboard/secciones/actividad.jpg",
    kicker: "Actividad",
  },
  {
    title: "Notas",
    desc: "Apuntes sueltos, frases que te impactaron, realizaciones súbitas. Sin fecha obligatoria — es tu cuaderno de referencias.",
    href: "/notas",
    icon: StickyNote,
    image: "/dashboard/secciones/notas.jpg",
    kicker: "Notas",
  },
  {
    title: "Foro",
    desc: "Próximamente — un espacio para compartir tu práctica con la comunidad de Odiseo.",
    href: "/foro",
    icon: MessageCircle,
    image: "/dashboard/secciones/foro.jpg",
    kicker: "Comunidad",
  },
  {
    title: "Planes",
    desc: "Completá un formulario con tu deseo y tus horarios. Germán te prepara un plan personalizado a medida.",
    href: "/planes",
    icon: ClipboardList,
    image: "/dashboard/secciones/planes.jpg",
    kicker: "Planes",
  },
  {
    title: "Mi libro",
    desc: "Escribí sobre un tema y se genera un capítulo reflexivo sobre tu proceso. Guardá y editá todos tus capítulos acá.",
    href: "/mi-libro",
    icon: BookMarked,
    image: "/dashboard/secciones/diario.jpg",
    kicker: "Libro",
  },
]

export default async function MiEspacioPage({
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
        <h1 className="text-3xl font-bold tracking-tight text-black">Mi espacio</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          />
        ))}
      </div>
    </div>
  )
}
