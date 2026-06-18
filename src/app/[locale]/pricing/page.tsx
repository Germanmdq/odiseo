import { createClient } from "@/lib/supabase/server"
import { PreciosClient } from "./components/precios-client"

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  return <PreciosClient locale={locale} userId={user?.id ?? null} />
}
