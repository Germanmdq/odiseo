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
    <div className="px-4 md:px-6">
      <CreadorDeEscenasView />
    </div>
  )
}
