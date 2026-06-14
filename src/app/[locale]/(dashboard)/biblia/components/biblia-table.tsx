"use client"

import * as React from "react"
import type { ColumnDef, PaginationState } from "@tanstack/react-table"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
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
    quote: string
    topic: string
    symbol: string
    source: string
  }
  drawer: {
    explanation: string
    context: string
    source: string
    empty: string
  }
}

function join(values: string[], empty = "—") {
  return values.length ? values.join(", ") : empty
}

function BibliaDrawer({
  item,
  labels,
}: {
  item: ContentArtifact
  labels: Labels
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {item.resumen || item.subtitle ? (
        <section className="space-y-2 rounded-md border p-4">
          <h3 className="font-medium">{labels.drawer.context}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {item.resumen || item.subtitle}
          </p>
        </section>
      ) : null}

      <section className="space-y-3">
        <h3 className="font-medium">{labels.drawer.explanation}</h3>
        <article className="rounded-md border p-5 text-base leading-relaxed space-y-4">
          {formatBodyParagraphs(item.body).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </article>
      </section>

      <section className="space-y-2">
        <h3 className="font-medium">{labels.drawer.source}</h3>
        <p className="text-muted-foreground">
          {join([...item.conferenciasCitadas, ...item.librosCitados], item.sourceTable || labels.drawer.empty)}
        </p>
      </section>
    </div>
  )
}

export function BibliaTable({
  rows,
  total,
  page,
  pageSize,
  pageCount,
  labels,
}: {
  rows: ContentArtifact[]
  total: number
  page: number
  pageSize: number
  pageCount: number
  labels: Labels
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

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
        accessorKey: "title",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={labels.columns.quote} />
        ),
        cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
        enableHiding: false,
      },
      {
        id: "temaPrincipal",
        accessorFn: (row) => join(row.temaPrincipal),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={labels.columns.topic} />
        ),
      },
      {
        id: "symbol",
        accessorFn: (row) => join(row.tags),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={labels.columns.symbol} />
        ),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.tags.length ? (
              row.original.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))
            ) : (
              <span>—</span>
            )}
          </div>
        ),
      },
      {
        id: "source",
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
      getDrawerDescription={(row) => join(row.temaPrincipal, undefined)}
      renderDrawer={(row) => <BibliaDrawer item={row} labels={labels} />}
    />
  )
}
