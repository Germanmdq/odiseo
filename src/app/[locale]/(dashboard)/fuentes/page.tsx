import { getTranslations } from "next-intl/server"

import { getFuenteSummaries } from "@/lib/fuentes/data"
import { FuentesTable } from "./components/fuentes-table"
import { PersonalSubtitle } from "@/components/personal-subtitle"

export const revalidate = 3600

export default async function FuentesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "fuentes" })
  const sources = await getFuenteSummaries()

  return (
    <div className="flex-1 space-y-6 px-6 pt-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <PersonalSubtitle
          conNombre="{nombre}, explorá conferencias y libros completos de Neville Goddard."
          sinNombre="Conferencias y libros completos de Neville Goddard."
        />
      </div>

      <FuentesTable
        sources={sources}
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
            name: t("columns.name"),
            type: t("columns.type"),
            year: t("columns.year"),
            tags: t("columns.tags"),
          },
          tabs: {
            all: t("tabs.all"),
            conferences: t("tabs.conferences"),
            books: t("tabs.books"),
          },
          filters: {
            year: t("filters.year"),
            allYears: t("filters.allYears"),
            category: t("filters.category"),
            allCategories: t("filters.allCategories"),
          },
          types: {
            conferencia: t("types.conferencia"),
            libro: t("types.libro"),
            radio: t("types.radio"),
          },
          drawer: {
            loading: t("drawer.loading"),
            error: t("drawer.error"),
            back: t("drawer.back"),
            originalTitle: t("drawer.originalTitle"),
          },
        }}
      />
    </div>
  )
}
