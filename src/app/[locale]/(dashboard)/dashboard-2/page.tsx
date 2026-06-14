import { redirect } from "next/navigation"

export default async function Dashboard2({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/dashboard`)
}
