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
    <div className="px-0 md:px-6 h-[100dvh] md:h-[calc(100dvh-var(--header-height)-4rem)] overflow-hidden">
      <CoachView />
    </div>
  )
}
