"use client"

import { useParams } from "next/navigation"
import { Sparkles, Library, Users, Brain, BookMarked, ClipboardList, Video, MessageCircle } from "lucide-react"
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline"

export function OdiseoOrbital() {
  const params = useParams()
  const locale = (params?.locale as string) ?? "es"

  const timelineData = [
    {
      id: 1,
      title: "Coach",
      date: "Siempre disponible",
      content: "Conversá con Neville Goddard, Joseph Murphy, Emmet Fox o Florence Scovel Shinn. Cada uno responde desde su propia voz usando el contenido real de sus conferencias.",
      category: "Conversar",
      icon: MessageCircle,
      relatedIds: [2, 5],
      status: "completed" as const,
      energy: 100,
      href: `/${locale}/coach`,
    },
    {
      id: 2,
      title: "Creador de escenas",
      date: "Visualización",
      content: "Describí con quién estás, en qué lugar y qué clima hay. Se genera un instante de 2-3 segundos con todo el detalle sensorial de tu deseo cumplido.",
      category: "Conversar",
      icon: Sparkles,
      relatedIds: [1, 7],
      status: "completed" as const,
      energy: 95,
      href: `/${locale}/creador-de-escenas`,
    },
    {
      id: 3,
      title: "Fuentes",
      date: "1000+ conferencias",
      content: "El corpus completo de Neville Goddard en español. Conferencias y libros para estudiar directamente la fuente de las enseñanzas, sin intermediarios.",
      category: "Estudio",
      icon: Library,
      relatedIds: [4, 1],
      status: "completed" as const,
      energy: 90,
      href: `/${locale}/fuentes`,
    },
    {
      id: 4,
      title: "Testimonios",
      date: "Casos reales",
      content: "Personas que aplicaron la Ley y lo que les pasó, extraídos de las conferencias de Neville. No son opiniones — son los casos que él mismo narró.",
      category: "Estudio",
      icon: Users,
      relatedIds: [3, 5],
      status: "completed" as const,
      energy: 85,
      href: `/${locale}/testimonios`,
    },
    {
      id: 5,
      title: "Ponerme a prueba",
      date: "Evaluación",
      content: "Escribís un tema, elegís cuántas preguntas y respondés un múltiple choice generado por el asistente. Al terminar recibís tu puntaje y una respuesta elaborada de Neville.",
      category: "Conversar",
      icon: Brain,
      relatedIds: [1, 6],
      status: "completed" as const,
      energy: 80,
      href: `/${locale}/preguntas`,
    },
    {
      id: 6,
      title: "Mi libro",
      date: "Tu proceso",
      content: "Escribís un tema y el asistente genera un capítulo reflexivo desde las enseñanzas de Neville en primera persona. Editás, guardás y acumulás capítulos de tu propio libro.",
      category: "Mi espacio",
      icon: BookMarked,
      relatedIds: [5, 7],
      status: "completed" as const,
      energy: 75,
      href: `/${locale}/mi-libro`,
    },
    {
      id: 7,
      title: "Planes",
      date: "Personalizado",
      content: "Completás un formulario con tu deseo y tus horarios. Germán te prepara un plan de práctica diaria personalizado a medida.",
      category: "Mi espacio",
      icon: ClipboardList,
      relatedIds: [6, 8],
      status: "completed" as const,
      energy: 70,
      href: `/${locale}/planes`,
    },
    {
      id: 8,
      title: "Talleres",
      date: "Permanentemente actualizados",
      content: "Grabaciones de Germán González y Taty Baldi en constante crecimiento. La Ley, el Autoconcepto, Vivir desde el Final y el Despertar. Solo plan anual.",
      category: "Estudio",
      icon: Video,
      relatedIds: [3, 1],
      status: "completed" as const,
      energy: 65,
      href: `/${locale}/talleres`,
    },
  ]

  return (
    <section className="w-full bg-white border-t-2 border-black">
      <div className="text-center pt-16 pb-4 px-4">
        <p className="text-[#FF2B0A] text-sm tracking-widest uppercase mb-3 font-semibold">Todo en un lugar</p>
        <h2 className="text-black text-3xl md:text-4xl font-semibold">
          Una plataforma completa<br />para la práctica real
        </h2>
      </div>
      <RadialOrbitalTimeline timelineData={timelineData} />
    </section>
  )
}
