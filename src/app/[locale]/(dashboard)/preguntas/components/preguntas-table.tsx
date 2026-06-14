"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Search } from "lucide-react"

import { DataTable, DataTableColumnHeader } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { GuardarEnMemoriaButton } from "@/components/guardar-en-memoria-button"
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
    question: string
    topic: string
    level: string
    lifeArea: string
  }
  drawer: {
    question: string
    answer: string
    sources: string
    related: string
    empty: string
  }
  searchPlaceholder: string
  searchButton: string
  searching: string
  searchResults: string
  noResults: string
  searchError: string
}

type Props = {
  rows: ContentArtifact[]
  labels: Labels
}

function PreguntaDrawer({
  item,
  labels,
}: {
  item: ContentArtifact
  labels: Labels
}) {
  const allSources = [...item.librosCitados, ...item.conferenciasCitadas]

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="space-y-2 rounded-md border p-4">
        <h3 className="font-medium">{labels.drawer.question}</h3>
        <p className="text-muted-foreground leading-relaxed">
          {item.preguntaOriginal || item.title}
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-medium">{labels.drawer.answer}</h3>
        <article className="rounded-md border p-5 text-base leading-relaxed space-y-4">
          {formatBodyParagraphs(item.body).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </article>
      </section>

      {allSources.length ? (
        <section className="space-y-2">
          <h3 className="font-medium">{labels.drawer.sources}</h3>
          <div className="flex flex-wrap gap-2">
            {allSources.map((s) => (
              <Badge key={s} variant="outline">
                {s}
              </Badge>
            ))}
          </div>
        </section>
      ) : null}

      {item.preguntasRelacionadas.length ? (
        <section className="space-y-2">
          <h3 className="font-medium">{labels.drawer.related}</h3>
          <ul className="text-muted-foreground space-y-1 text-sm">
            {item.preguntasRelacionadas.map((q, i) => (
              <li key={i}>• {q}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="flex justify-end pt-2">
        <div className="group flex items-center gap-2">
          <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            Guardar en Memoria
          </span>
          <GuardarEnMemoriaButton
            contenido={item.body}
            origenTipo="pregunta"
            origenMeta={{ preguntaId: item.id }}
            source="Preguntas"
            className="!opacity-100"
          />
        </div>
      </div>
    </div>
  )
}

export function PreguntasTable({ rows, labels }: Props) {
  const [selectedRow, setSelectedRow] = React.useState<ContentArtifact | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<ContentArtifact[] | null>(null)
  const [isSearching, setIsSearching] = React.useState(false)
  const [searchError, setSearchError] = React.useState(false)

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = searchQuery.trim()
    if (!query) return

    setIsSearching(true)
    setSearchError(false)
    setSearchResults(null)

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        setSearchError(true)
        return
      }

      const data = (await response.json()) as { results: ContentArtifact[] }
      setSearchResults(data.results ?? [])
    } catch {
      setSearchError(true)
    } finally {
      setIsSearching(false)
    }
  }

  const columns = React.useMemo<ColumnDef<ContentArtifact>[]>(
    () => [
      {
        id: "question",
        accessorFn: (row) => row.preguntaOriginal || row.title,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={labels.columns.question} />
        ),
        cell: ({ row }) => (
          <div className="max-w-[480px]">
            <p className="font-medium leading-snug">
              {row.original.preguntaOriginal || row.original.title}
            </p>
          </div>
        ),
        enableHiding: false,
      },
      {
        id: "temaPrincipal",
        accessorFn: (row) => row.temaPrincipal.join(", ") || labels.drawer.empty,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={labels.columns.topic} />
        ),
        cell: ({ row }) =>
          row.original.temaPrincipal.length ? (
            <span className="line-clamp-2">{row.original.temaPrincipal.join(", ")}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "nivelDificultad",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={labels.columns.level} />
        ),
        cell: ({ row }) =>
          row.original.nivelDificultad ? (
            <Badge variant="secondary">{row.original.nivelDificultad}</Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "areaVida",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={labels.columns.lifeArea} />
        ),
        cell: ({ row }) =>
          row.original.areaVida ? (
            <Badge variant="outline">{row.original.areaVida}</Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
    ],
    [labels]
  )

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={labels.searchPlaceholder}
            className="pl-9 text-base"
          />
        </div>
        <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
          {isSearching ? labels.searching : labels.searchButton}
        </Button>
      </form>

      {searchError ? (
        <p className="text-destructive text-sm">{labels.searchError}</p>
      ) : null}

      {searchResults !== null ? (
        <div className="space-y-3">
          <h2 className="text-muted-foreground text-sm font-medium">
            {labels.searchResults}
          </h2>
          {searchResults.length === 0 ? (
            <p className="text-muted-foreground text-sm">{labels.noResults}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((result) => (
                <Card
                  key={result.id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => setSelectedRow(result)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-2 text-sm font-medium leading-snug">
                      {result.preguntaOriginal || result.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed">
                      {result.body}
                    </p>
                    {result.similarity != null ? (
                      <p className="text-muted-foreground mt-2 text-xs">
                        {Math.round(result.similarity * 100)}% relevancia
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <DataTable
        columns={columns}
        data={rows}
        labels={labels.table}
        getRowId={(row) => row.id}
        selectedRow={selectedRow}
        onSelectedRowChange={setSelectedRow}
        getDrawerTitle={(row) => row.preguntaOriginal || row.title}
        renderDrawer={(row) => <PreguntaDrawer item={row} labels={labels} />}
      />
    </div>
  )
}
