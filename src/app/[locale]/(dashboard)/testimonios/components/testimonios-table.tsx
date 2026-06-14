"use client"

import * as React from "react"
import type { ColumnDef, PaginationState } from "@tanstack/react-table"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { formatBodyParagraphs } from "@/lib/format-body"
import type { ContentArtifact } from "@/lib/content-artifacts/types"

type Labels = {
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
    excerpt: string
    topic: string
    technique: string
    level: string
    source: string
  }
  tabs: {
    all: string
    ley: string
    autoconcepto: string
    promesa: string
  }
  drawer: {
    fullText: string
    tags: string
    topic: string
    technique: string
    symbols: string
    level: string
    source: string
    empty: string
  }
  searchPlaceholder: string
}

type Props = {
  rows: ContentArtifact[]
  total: number
  page: number
  pageSize: number
  pageCount: number
  query: string
  nivel: string
  levelValues: {
    ley: string
    autoconcepto: string
    promesa: string
  }
  levelCounts: Record<string, number>
  labels: Labels
}

function join(values: string[], empty = "—") {
  return values.length ? values.join(", ") : empty
}

function TagList({ label, values }: { label: string; values: string[] }) {
  if (!values.length) return null

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-xs">{label}</p>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <Badge key={value} variant="secondary">
            {value}
          </Badge>
        ))}
      </div>
    </div>
  )
}

function TestimonioDrawer({
  item,
  labels,
}: {
  item: ContentArtifact
  labels: Labels
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="space-y-3">
        <h3 className="font-medium">{labels.drawer.fullText}</h3>
        <article className="rounded-md border p-5 text-base leading-relaxed space-y-4">
          {formatBodyParagraphs(item.body).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </article>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <TagList label={labels.drawer.topic} values={item.temaPrincipal} />
        <TagList label={labels.drawer.technique} values={item.tecnica} />
        <TagList label={labels.drawer.symbols} values={item.tags} />
        <div>
          <p className="text-muted-foreground text-xs">{labels.drawer.level}</p>
          <p className="font-medium">{item.nivelDificultad || labels.drawer.empty}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-muted-foreground text-xs">{labels.drawer.source}</p>
          <p className="font-medium">
            {join([...item.conferenciasCitadas, ...item.librosCitados], item.sourceTable || "—")}
          </p>
        </div>
      </div>
    </div>
  )
}

export function TestimoniosTable({
  rows,
  total,
  page,
  pageSize,
  pageCount,
  query,
  nivel,
  levelValues,
  levelCounts,
  labels,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = React.useState(query)

  function updateParams(updates: Record<string, string | number | null>) {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
    })

    router.push(`${pathname}?${params.toString()}`)
  }

  const columns = React.useMemo<ColumnDef<ContentArtifact>[]>(
    () => [
      {
        accessorKey: "excerpt",
        size: 500,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={labels.columns.excerpt} />
        ),
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="line-clamp-2 font-medium leading-snug">
              {row.original.excerpt}
            </p>
            <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">
              {row.original.title}
            </p>
          </div>
        ),
        enableHiding: false,
      },
      {
        id: "temaPrincipal",
        size: 190,
        accessorFn: (row) => join(row.temaPrincipal),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={labels.columns.topic} />
        ),
        cell: ({ row }) => (
          <span className="line-clamp-2 leading-snug">
            {join(row.original.temaPrincipal)}
          </span>
        ),
      },
      {
        id: "tecnica",
        size: 150,
        accessorFn: (row) => join(row.tecnica),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={labels.columns.technique} />
        ),
        cell: ({ row }) => (
          <span className="line-clamp-2 leading-snug">
            {join(row.original.tecnica)}
          </span>
        ),
      },
      {
        accessorKey: "nivelDificultad",
        size: 210,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={labels.columns.level} />
        ),
        cell: ({ row }) => (
          <span className="line-clamp-2 leading-snug">
            {row.original.nivelDificultad || "—"}
          </span>
        ),
      },
      {
        id: "source",
        size: 220,
        accessorFn: (row) =>
          join([...row.conferenciasCitadas, ...row.librosCitados], row.sourceTable || "—"),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={labels.columns.source} />
        ),
        cell: ({ row }) => (
          <span className="line-clamp-2">
            {join(
              [...row.original.conferenciasCitadas, ...row.original.librosCitados],
              row.original.sourceTable || "—"
            )}
          </span>
        ),
      },
    ],
    [labels]
  )

  return (
    <DataTable
      columns={columns}
      data={rows}
      labels={labels.table}
      activeTab={nivel}
      onTabChange={(value) =>
        updateParams({ nivel: value === "all" ? null : value, page: 1 })
      }
      tabs={[
        { value: "all", label: labels.tabs.all, count: total },
        {
          value: levelValues.ley,
          label: labels.tabs.ley,
          count: levelCounts[levelValues.ley] ?? 0,
        },
        {
          value: levelValues.autoconcepto,
          label: labels.tabs.autoconcepto,
          count: levelCounts[levelValues.autoconcepto] ?? 0,
        },
        {
          value: levelValues.promesa,
          label: labels.tabs.promesa,
          count: levelCounts[levelValues.promesa] ?? 0,
        },
      ]}
      toolbar={
        <form
          onSubmit={(event) => {
            event.preventDefault()
            updateParams({ q: search.trim() || null, page: 1 })
          }}
        >
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={labels.searchPlaceholder}
            className="max-w-xl"
          />
        </form>
      }
      manualPagination={{
        pageIndex: page - 1,
        pageSize,
        pageCount,
        totalRows: total,
        onPaginationChange: (pagination: PaginationState) =>
          updateParams({
            page: pagination.pageIndex + 1,
            pageSize: pagination.pageSize,
          }),
      }}
      getRowId={(row) => row.id}
      getDrawerTitle={(row) => row.title}
      getDrawerDescription={(row) => row.nivelDificultad ?? ""}
      renderDrawer={(row) => <TestimonioDrawer item={row} labels={labels} />}
    />
  )
}
