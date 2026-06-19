import { createClient } from "@/lib/supabase/server"
import { checkAccess } from "@/lib/acceso"
import { Paywall } from "@/components/paywall"
import { CreadorDeEscenasView } from "./components/creador-de-escenas-view"

export default async function CreadorDeEscenasPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const acceso = await checkAccess(user.id)
    if (!acceso.allowed) {
      return <Paywall locale={locale} />
    }
  }

  return (
    <div className="h-full overflow-hidden px-0 pb-0 md:h-[calc(100dvh-var(--header-height)-4rem)] md:px-6">
      <CreadorDeEscenasView />
    </div>
  )
}
