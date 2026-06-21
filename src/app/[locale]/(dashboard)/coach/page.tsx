import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { checkAccess } from "@/lib/acceso"
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
      redirect(`/${locale}/pricing`)
    }
  }

  return (
    <div className="h-full overflow-hidden px-0 md:h-[calc(100dvh-var(--header-height)-4rem)] md:px-6">
      <CoachView />
    </div>
  )
}
