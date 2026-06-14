"use client"

import * as React from "react"
import { ArrowLeft } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { formatBodyParagraphs } from "@/lib/format-body"
import type { FuenteDetail, FuenteSummary, FuenteType } from "@/lib/fuentes/types"

type FuentesLabels = {
  table: {
    columns: string
    customizeColumns: string
    empty: string
    rowsPerPage: string
    page: string
    of: string
    firstPage: string
    previousPage: string
    nextPage: string
    lastPage: string
    view: string
  }
  columns: {
    name: string
    type: string
    year: string
    tags: string
  }
  tabs: {
    all: string
    conferences: string
    books: string
  }
  filters: {
    year: string
    allYears: string
    category: string
    allCategories: string
  }
  types: Record<FuenteType, string>
  drawer: {
    loading: string
    error: string
    back: string
    originalTitle: string
  }
}

function FuenteDrawer({
  source,
  labels,
}: {
  source: FuenteSummary
  labels: FuentesLabels
}) {
  const [detail, setDetail] = React.useState<FuenteDetail | null>(null)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    const controller = new AbortController()

    async function loadDetail() {
      setDetail(null)
      setError(false)

      const params = new URLSearchParams({ sourceKey: source.sourceKey })
      const response = await fetch(`/api/fuentes/source?${params}`, {
        signal: controller.signal,
      })

      if (!response.ok) {
        setError(true)
        return
      }

      setDetail((await response.json()) as FuenteDetail)
    }

    loadDetail().catch((loadError) => {
      if (!controller.signal.aborted) {
        console.error(loadError)
        setError(true)
      }
    })

    return () => controller.abort()
  }, [source.sourceKey])

  const typeLine = detail ? labels.types[detail.type] : labels.types[source.type]
  const yearLine = detail ? detail.year : source.year

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Back button */}
      <div className="border-b px-4 py-3 shrink-0">
        <DrawerClose asChild>
          <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
            <ArrowLeft className="h-4 w-4" />
            {labels.drawer.back}
          </Button>
        </DrawerClose>
      </div>

      {/* Scrollable body — mx-auto max-w-3xl constrains the reading column */}
      <div className="flex-1 overflow-y-auto py-10">
        <div className="mx-auto max-w-3xl px-6">
          {/* Title */}
          <h1 className="text-center text-3xl font-bold leading-tight">
            {source.name}
          </h1>

          {/* Metadata: type · year */}
          <p className="text-muted-foreground mt-3 text-center text-sm">
            {typeLine}
            {yearLine ? ` · ${yearLine}` : ""}
          </p>

          {/* Original title */}
          {detail?.originalTitle ? (
            <p className="text-muted-foreground mt-1 text-center text-sm italic">
              &ldquo;{detail.originalTitle}&rdquo;
            </p>
          ) : null}

          {/* Divider */}
          <div className="border-b my-8" />

          {error ? (
            <p className="text-destructive text-center">{labels.drawer.error}</p>
          ) : !detail ? (
            <div className="space-y-3">
              <p className="text-muted-foreground text-center text-sm">{labels.drawer.loading}</p>
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/6" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
            </div>
          ) : (
            <div className="space-y-4 text-base leading-relaxed">
              {formatBodyParagraphs(detail.fullText).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function FuentesTable({
  sources,
  labels,
}: {
  sources: FuenteSummary[]
  labels: FuentesLabels
}) {
  const [selectedSource, setSelectedSource] = React.useState<FuenteSummary | null>(null)
  const [yearFilter, setYearFilter] = React.useState("all")
  const [categoryFilter, setCategoryFilter] = React.useState("all")

  const years = React.useMemo(
    () =>
      Array.from(new Set(sources.map((source) => source.year).filter(Boolean)))
        .sort((a, b) => Number(a) - Number(b)) as string[],
    [sources]
  )

  const categories = React.useMemo(
    () =>
      Array.from(new Set(sources.flatMap((source) => source.tags)))
        .sort((a, b) => a.localeCompare(b, "es")),
    [sources]
  )

  const filteredSources = React.useMemo(
    () =>
      sources.filter((source) => {
        const matchesYear = yearFilter === "all" || source.year === yearFilter
        const matchesCategory =
          categoryFilter === "all" || source.tags.includes(categoryFilter)
        return matchesYear && matchesCategory
      }),
    [categoryFilter, sources, yearFilter]
  )

  const columns = React.useMemo<ColumnDef<FuenteSummary>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={labels.columns.name} />
        ),
        cell: ({ row }) => (
          <div className="max-w-[420px]">
            <p className="font-medium leading-snug">{row.original.name}</p>
          </div>
        ),
        enableHiding: false,
      },
    ],
    [labels]
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredSources}
        labels={labels.table}
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">{labels.filters.year}</span>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="h-9 w-[150px]">
                  <SelectValue placeholder={labels.filters.allYears} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{labels.filters.allYears}</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                {labels.filters.category}
              </span>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 w-[220px]">
                  <SelectValue placeholder={labels.filters.allCategories} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{labels.filters.allCategories}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        }
        getRowId={(row) => row.id}
        selectedRow={selectedSource}
        onSelectedRowChange={setSelectedSource}
        tabs={[
          { value: "all", label: labels.tabs.all },
          {
            value: "conferencias",
            label: labels.tabs.conferences,
            filter: (row) => row.type === "conferencia" || row.type === "radio",
          },
          {
            value: "libros",
            label: labels.tabs.books,
            filter: (row) => row.type === "libro",
          },
        ]}
      />

      <Drawer
        direction="right"
        open={Boolean(selectedSource)}
        onOpenChange={(open) => {
          if (!open) setSelectedSource(null)
        }}
      >
        <DrawerContent className="odiseo-reading-drawer h-full overflow-hidden">
          <DrawerTitle className="sr-only">{selectedSource?.name ?? ""}</DrawerTitle>
          {selectedSource ? (
            <FuenteDrawer source={selectedSource} labels={labels} />
          ) : null}
        </DrawerContent>
      </Drawer>
    </>
  )
}
