"use client"

import * as React from "react"
import type { ColumnDef, PaginationState } from "@tanstack/react-table"
import { usePathname, useRouter, useSearchParams, useParams } from "next/navigation"

import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { formatBodyParagraphs } from "@/lib/format-body"
import type { ContentArtifact } from "@/lib/content-artifacts/types"
import Link from "next/link"
import { ReutilizarEnButton } from "@/components/reutilizar-en-button"
import { GuardarEnMemoriaButton } from "@/components/guardar-en-memoria-button"

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
  locale,
}: {
  item: ContentArtifact
  labels: Labels
  locale: string
}) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-8 space-y-6">
      <h2 className="text-xl font-semibold">{item.title}</h2>
      
      <div className="rounded-lg bg-muted p-5 text-sm leading-relaxed space-y-4">
        {formatBodyParagraphs(item.body).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {item.temaPrincipal?.map((t) => (
          <span key={t} className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">{t}</span>
        ))}
        {item.tecnica?.map((t) => (
          <span key={t} className="rounded-full border px-3 py-1 text-xs">{t}</span>
        ))}
      </div>

      {item.fuente_id ? (
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-1">Fuente</p>
          <Link
            href={`/es/fuentes?sourceKey=${item.fuente_id}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver conferencia completa →
          </Link>
        </div>
      ) : item.sourceTable ? (
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-1">Fuente</p>
          <p className="text-sm">{item.sourceTable}</p>
        </div>
      ) : null}

      <div className="flex gap-2 pt-2">
        <ReutilizarEnButton content={item.body} origen="testimonios" />
        <GuardarEnMemoriaButton contenido={item.body} origenTipo="coach" origenMeta={{}} source="Testimonios" />
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
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-sm">{row.original.title}</span>
            <span className="text-xs text-muted-foreground">{row.original.temaPrincipal?.[0] ?? "—"}</span>
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
    ],
    [labels]
  )

  const params = useParams()
  const locale = (params.locale as string) ?? "es"

  return (
    <DataTable
      columns={columns}
      data={rows}
      labels={labels.table}
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
      renderDrawer={(row) => <TestimonioDrawer item={row} labels={labels} locale={locale} />}
    />
  )
}
