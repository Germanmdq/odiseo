import { redirect } from "next/navigation"

export default async function AppearanceRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/configuracion/perfil`)
}
