import { createClient } from "@/lib/supabase/server"
import { checkAccess } from "@/lib/acceso"
import { Paywall } from "@/components/paywall"
import { CoachView } from "./components/coach-view"

export default async function CoachPage({
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
      <CoachView />
    </div>
  )
}
