import { redirect } from "next/navigation"

export default async function NarradorPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/creador-de-escenas`)
}
