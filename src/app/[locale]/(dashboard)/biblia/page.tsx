import { getTranslations } from "next-intl/server"

import { getContentArtifactsPage } from "@/lib/content-artifacts/data"
import { BibliaTable } from "./components/biblia-table"

export const revalidate = 3600

export default async function BibliaPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string; pageSize?: string }>
}) {
  const { locale } = await params
  const { page = "1", pageSize = "10" } = await searchParams
  const t = await getTranslations({ locale, namespace: "biblia" })

  const result = await getContentArtifactsPage({
    subtype: "explanation",
    page: Number(page),
    pageSize: Number(pageSize),
  })

  return (
    <div className="flex-1 space-y-6 px-6 pt-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("subtitle", { count: result.total })}
        </p>
      </div>

      <BibliaTable
        rows={result.rows}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        pageCount={result.pageCount}
        labels={{
          table: {
            columns: t("table.columns"),
            customizeColumns: t("table.customizeColumns"),
            empty: t("table.empty"),
            rowsPerPage: t("table.rowsPerPage"),
            page: t("table.page"),
            of: t("table.of"),
            firstPage: t("table.firstPage"),
            previousPage: t("table.previousPage"),
            nextPage: t("table.nextPage"),
            lastPage: t("table.lastPage"),
            view: t("table.view"),
          },
          columns: {
            quote: t("columns.quote"),
            topic: t("columns.topic"),
            symbol: t("columns.symbol"),
            source: t("columns.source"),
          },
          drawer: {
            explanation: t("drawer.explanation"),
            context: t("drawer.context"),
            source: t("drawer.source"),
            empty: t("drawer.empty"),
          },
        }}
      />
    </div>
  )
}
