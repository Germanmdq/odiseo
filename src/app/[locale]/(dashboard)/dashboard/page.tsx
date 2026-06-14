import { getTranslations } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import {
  MessageSquareText, Sparkles, Brain, BookOpen, Library,
  ScrollText, GraduationCap, Calendar, FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const APPS = [
  { title: "Coach", desc: "Conversaciones con maestros de la imaginación.", href: "/coach", icon: MessageSquareText },
  { title: "Creador de escenas", desc: "Diseñá escenas vívidas con IA.", href: "/creador-de-escenas", icon: Sparkles },
  { title: "Memoria", desc: "Todo lo que guardaste en conversaciones.", href: "/memoria", icon: Brain },
  { title: "Mi libro", desc: "Capítulos construidos desde tu proceso.", href: "/mi-libro", icon: BookOpen },
]

const ESTUDIO = [
  { title: "Fuentes", desc: "Conferencias y libros de Neville.", href: "/fuentes", icon: Library },
  { title: "Testimonios", desc: "Casos reales de la ley.", href: "/testimonios", icon: ScrollText },
  { title: "Talleres", desc: "32 grabaciones con Germán y Taty.", href: "/talleres", icon: GraduationCap },
]

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "dashboard.home" })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch nombre_preferido from profile
  let nombre = "por acá"
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nombre_preferido, display_name, full_name")
      .eq("id", user.id)
      .maybeSingle()
    nombre = profile?.nombre_preferido || profile?.display_name || profile?.full_name ||
      user.user_metadata?.nombre_preferido || "por acá"
  }

  return (
    <div className="flex-1 space-y-8 px-4 lg:px-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bienvenido, {nombre}</h1>
        <p className="text-muted-foreground">¿Con qué querés trabajar hoy?</p>
      </div>

      {/* Apps grid */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Apps</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {APPS.map((app) => (
            <Link key={app.href} href={`/${locale}${app.href}`}>
              <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <app.icon className="size-4" />
                  </div>
                  <CardTitle className="text-base">{app.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{app.desc}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Planes card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base">Tu plan personalizado</CardTitle>
              <CardDescription>Contanos tu deseo y Germán te prepara un plan a medida.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button asChild size="sm" className="cursor-pointer">
            <Link href={`/${locale}/planes`}>Solicitar mi plan</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Estudio */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Estudio</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {ESTUDIO.map((item) => (
            <Link key={item.href} href={`/${locale}${item.href}`}>
              <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground mb-2 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <item.icon className="size-4" />
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{item.desc}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Mi actividad quick link */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Ver tu actividad y racha de práctica</span>
        <Button variant="ghost" size="sm" asChild className="cursor-pointer gap-2">
          <Link href={`/${locale}/actividad`}>
            <Calendar className="h-4 w-4" />
            Mi actividad
          </Link>
        </Button>
      </div>
    </div>
  )
}
