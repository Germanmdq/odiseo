"use client"

import * as React from "react"
import type { ColumnDef, PaginationState } from "@tanstack/react-table"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { CompartirEn } from "@/components/compartir-en"
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

function BibliaDrawer({ item }: { item: ContentArtifact }) {
  const parrafos = formatBodyParagraphs(item.body)
  const cita = parrafos[0] ?? ""
  const explicacion = parrafos.slice(1)

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 space-y-8">
      {/* Referencia */}
      <p className="text-xs text-muted-foreground uppercase tracking-widest">
        {item.title}
      </p>

      {/* Primer párrafo = la cita bíblica */}
      {cita && (
        <blockquote className="text-xl md:text-2xl font-semibold leading-snug border-l-4 pl-4" style={{ borderColor: "#E8401A" }}>
          {cita}
        </blockquote>
      )}

      {/* Resto = explicación de Neville */}
      {explicacion.length > 0 && (
        <div className="text-base leading-relaxed space-y-4 text-muted-foreground">
          {explicacion.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}

      <div className="pt-4 border-t">
        <CompartirEn contenido={item.body} titulo={item.title} origen="biblia" label="Usar este contenido" />
      </div>
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
      renderDrawer={(row) => <BibliaDrawer item={row} />}
    />
  )
}
