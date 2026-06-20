import { getTranslations } from "next-intl/server"

import {
  getContentArtifactsPage,
} from "@/lib/content-artifacts/data"
import { TestimoniosTable } from "./components/testimonios-table"
import { PersonalSubtitle } from "@/components/personal-subtitle"

export const revalidate = 3600

export default async function TestimoniosPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; page?: string; pageSize?: string }>
}) {
  const { locale } = await params
  const { q = "", page = "1", pageSize = "10" } = await searchParams
  const t = await getTranslations({ locale, namespace: "testimonios" })

  const result = await getContentArtifactsPage({
    subtype: "testimonial",
    page: Number(page),
    pageSize: Number(pageSize),
    query: q,
  })

  return (
    <div className="flex-1 space-y-6 px-6 pt-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <PersonalSubtitle
          conNombre={`{nombre}, ${result.total} testimonios reales para tu práctica.`}
          sinNombre={t("subtitle", { count: result.total })}
        />
      </div>

      <TestimoniosTable
        rows={result.rows}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        pageCount={result.pageCount}
        query={q}
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
            excerpt: t("columns.excerpt"),
            topic: t("columns.topic"),
            technique: t("columns.technique"),
            level: t("columns.level"),
            source: t("columns.source"),
          },
          drawer: {
            fullText: t("drawer.fullText"),
            tags: t("drawer.tags"),
            topic: t("drawer.topic"),
            technique: t("drawer.technique"),
            symbols: t("drawer.symbols"),
            level: t("drawer.level"),
            source: t("drawer.source"),
            empty: t("drawer.empty"),
          },
          searchPlaceholder: t("searchPlaceholder"),
        }}
      />
    </div>
  )
}
