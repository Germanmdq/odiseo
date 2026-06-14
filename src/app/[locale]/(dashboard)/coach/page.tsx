import { createClient } from "@/lib/supabase/server"
import { checkAccess } from "@/lib/acceso"
import { UsageHint } from "@/components/usage-hint"
import { CoachView } from "./components/coach-view"

export default async function CoachPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let usosRestantes: number | null = null
  if (user) {
    const acceso = await checkAccess(user.id)
    if (!acceso.suscripto) usosRestantes = acceso.usosRestantes
  }

  return (
    <div className="px-4 md:px-6 space-y-3">
      {usosRestantes !== null && usosRestantes <= 3 && (
        <UsageHint usosRestantes={usosRestantes} locale={locale} />
      )}
      <CoachView />
    </div>
  )
}
