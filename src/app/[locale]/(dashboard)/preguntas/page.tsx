import { getTranslations } from "next-intl/server"

import { PreguntasView } from "./components/preguntas-view"

export default async function PreguntasPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "preguntas" })

  return (
    <div className="flex-1 space-y-4 px-6 pt-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      </div>
      <PreguntasView />
    </div>
  )
}
