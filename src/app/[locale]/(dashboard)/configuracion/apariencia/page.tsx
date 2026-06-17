import { redirect } from "next/navigation"

export default async function AparienciaRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/configuracion/perfil`)
}
