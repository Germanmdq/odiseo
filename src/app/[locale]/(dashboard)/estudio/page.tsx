import Link from "next/link"
import { ArrowLeft, Library, ScrollText, Cross, GraduationCap } from "lucide-react"
import { OdiseoHubCard } from "@/components/odiseo-hub-card"

const CARDS = [
  {
    title: "Fuentes",
    desc: "621 conferencias y libros completos de Neville Goddard traducidos al español. Buscá por título, año o categoría.",
    href: "/fuentes",
    icon: Library,
    image: "/dashboard/secciones/fuentes.jpg",
  },
  {
    title: "Testimonios y casos",
    desc: "Casos reales narrados por Neville en sus conferencias — personas que aplicaron la Ley y lo que les pasó.",
    href: "/testimonios",
    icon: ScrollText,
    image: "/dashboard/secciones/testimonios.jpg",
  },
  {
    title: "Biblia metafísica",
    desc: "1085 citas bíblicas con la interpretación de Neville Goddard. La Biblia como mapa del mundo interior, no como historia literal.",
    href: "/biblia",
    icon: Cross,
    image: "/dashboard/secciones/biblia.jpg",
  },
  {
    title: "Talleres",
    desc: "4 talleres actuales de Germán González y Taty Baldi, más 8 talleres nuevos próximos durante el año. Incluidos en el plan anual.",
    href: "/talleres",
    icon: GraduationCap,
    image: "/dashboard/secciones/talleres.jpg",
  },
]

export default async function EstudioPage({
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
        <h1 className="text-3xl font-bold tracking-tight text-black">Estudio</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {CARDS.map((card) => (
          <OdiseoHubCard
            key={card.href}
            href={`/${locale}${card.href}`}
            title={card.title}
            desc={card.desc}
            icon={card.icon}
            image={card.image}
          />
        ))}
      </div>
    </div>
  )
}
