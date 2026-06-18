import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Mail, Clock, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface PlanSolicitud {
  id: string
  user_id: string
  deseo: string
  duracion_dias: number
  status: string
  respuesta: string | null
  created_at: string
}

export default async function MensajesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()

  // Mark all "respondido" requests as "leido" when the user views this page
  await admin
    .from("plan_solicitudes")
    .update({ status: "leido" })
    .eq("user_id", user.id)
    .eq("status", "respondido")

  const { data: solicitudes } = await admin
    .from("plan_solicitudes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const typedSolicitudes = (solicitudes ?? []) as PlanSolicitud[]

  if (!typedSolicitudes.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-4">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center">
          <Mail className="size-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold">Mensajes</h1>
        <p className="text-muted-foreground max-w-md">
          Acá vas a ver las respuestas de Germán a tus solicitudes de plan. 
          Todavía no hiciste ninguna solicitud.
        </p>
        <Button asChild style={{ backgroundColor: "#E8401A" }} className="text-white mt-2 cursor-pointer">
          <Link href={`/${locale}/planes`}>Pedir mi primer plan</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Mensajes</h1>
        <p className="text-muted-foreground mt-1">
          Tus solicitudes de plan y las respuestas de Germán.
        </p>
      </div>

      <div className="space-y-4">
        {typedSolicitudes.map(sol => {
          const isAnswered = sol.status === "respondido" || sol.status === "leido"
          return (
            <div key={sol.id} className="rounded-xl border bg-card p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(sol.created_at), { addSuffix: true, locale: es })}
                    {" · "}{sol.duracion_dias} días
                  </p>
                  <p className="text-sm font-medium line-clamp-2">{sol.deseo}</p>
                </div>
                <span className={`shrink-0 flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 ${
                  isAnswered
                    ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {isAnswered
                    ? <><CheckCircle className="size-3" /> Respondido</>
                    : <><Clock className="size-3" /> Pendiente</>
                  }
                </span>
              </div>

              {/* Respuesta de Germán */}
              {sol.respuesta ? (
                <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Respuesta de Germán
                  </p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {sol.respuesta}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg bg-muted/30 p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Germán todavía no respondió esta solicitud.
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
