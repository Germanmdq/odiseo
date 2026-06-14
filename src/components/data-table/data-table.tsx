"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type DataTableTab<TData> = {
  value: string
  label: string
  count?: number
  filter?: (row: TData) => boolean
}

export type DataTableLabels = {
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

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  tabs?: DataTableTab<TData>[]
  labels: DataTableLabels
  toolbar?: React.ReactNode
  activeTab?: string
  onTabChange?: (value: string) => void
  manualPagination?: {
    pageIndex: number
    pageSize: number
    pageCount: number
    totalRows: number
    onPaginationChange: (pagination: PaginationState) => void
  }
  selectedRow?: TData | null
  onSelectedRowChange?: (row: TData | null) => void
  getRowId?: (row: TData) => string
  getDrawerTitle?: (row: TData) => string
  getDrawerDescription?: (row: TData) => string
  renderDrawer?: (row: TData) => React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  tabs,
  labels,
  toolbar,
  activeTab: controlledActiveTab,
  onTabChange,
  manualPagination,
  selectedRow: controlledSelectedRow,
  onSelectedRowChange,
  getRowId,
  getDrawerTitle,
  getDrawerDescription,
  renderDrawer,
}: DataTableProps<TData, TValue>) {
  const firstTab = tabs?.[0]?.value ?? "all"
  const [uncontrolledActiveTab, setUncontrolledActiveTab] =
    React.useState(firstTab)
  const [uncontrolledSelectedRow, setUncontrolledSelectedRow] =
    React.useState<TData | null>(null)
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const activeTab = controlledActiveTab ?? uncontrolledActiveTab
  const selectedRow = controlledSelectedRow ?? uncontrolledSelectedRow
  const paginationState = manualPagination
    ? {
        pageIndex: manualPagination.pageIndex,
        pageSize: manualPagination.pageSize,
      }
    : pagination

  function setActiveTab(value: string) {
    setUncontrolledActiveTab(value)
    onTabChange?.(value)
  }

  function setSelectedRow(row: TData | null) {
    setUncontrolledSelectedRow(row)
    onSelectedRowChange?.(row)
  }

  const activeTabConfig = tabs?.find((tab) => tab.value === activeTab)
  const tableData = React.useMemo(() => {
    if (!activeTabConfig?.filter) return data
    return data.filter(activeTabConfig.filter)
  }, [activeTabConfig, data])

  React.useEffect(() => {
    if (!manualPagination) {
      setPagination((current) => ({ ...current, pageIndex: 0 }))
    }
  }, [activeTab, manualPagination])

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination: paginationState,
    },
    manualPagination: Boolean(manualPagination),
    pageCount: manualPagination?.pageCount,
    getRowId,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(paginationState) : updater

      if (manualPagination) {
        manualPagination.onPaginationChange(next)
      } else {
        setPagination(next)
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const drawerTitle =
    selectedRow && getDrawerTitle ? getDrawerTitle(selectedRow) : undefined
  const drawerDescription =
    selectedRow && getDrawerDescription
      ? getDrawerDescription(selectedRow)
      : undefined

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 lg:px-6">
        {tabs?.length ? (
          <>
            <Label htmlFor="view-selector" className="sr-only">
              {labels.view}
            </Label>
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger
                className="flex w-fit sm:hidden"
                size="sm"
                id="view-selector"
              >
                <SelectValue placeholder={labels.view} />
              </SelectTrigger>
              <SelectContent>
                {tabs.map((tab) => (
                  <SelectItem key={tab.value} value={tab.value}>
                    {tab.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="hidden sm:flex"
            >
              <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1">
                {tabs.map((tab) => {
                  const count =
                    tab.count ?? data.filter(tab.filter ?? (() => true)).length

                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="cursor-pointer"
                    >
                      {tab.label}
                      <Badge variant="secondary">{count}</Badge>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>
          </>
        ) : (
          <div />
        )}

      </div>

      {toolbar ? <div className="px-4 lg:px-6">{toolbar}</div> : null}

      <div className="px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table className="table-fixed">
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={
                      renderDrawer != null || onSelectedRowChange != null
                        ? "cursor-pointer hover:bg-muted/50"
                        : undefined
                    }
                    onClick={() => {
                      if (renderDrawer != null || onSelectedRowChange != null) {
                        setSelectedRow(row.original)
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                        className="align-top"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {labels.empty}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-end px-4 lg:px-6">
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              {labels.rowsPerPage}
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger
                size="sm"
                className="w-20 cursor-pointer"
                id="rows-per-page"
              >
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            {labels.page} {table.getState().pagination.pageIndex + 1}{" "}
            {labels.of} {table.getPageCount() || 1}
            {manualPagination ? (
              <span className="text-muted-foreground ml-2">
                ({manualPagination.totalRows})
              </span>
            ) : null}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden size-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">{labels.firstPage}</span>
              <ChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">{labels.previousPage}</span>
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">{labels.nextPage}</span>
              <ChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">{labels.lastPage}</span>
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>

      {renderDrawer ? (
        <Drawer
          direction="right"
          open={Boolean(selectedRow)}
          onOpenChange={(open) => {
            if (!open) setSelectedRow(null)
          }}
        >
          <DrawerContent className="odiseo-reading-drawer h-full overflow-hidden">
            <DrawerHeader className="gap-1">
              <DrawerTitle>{drawerTitle}</DrawerTitle>
              {drawerDescription ? (
                <DrawerDescription>{drawerDescription}</DrawerDescription>
              ) : null}
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-4 pb-6 text-sm">
              {selectedRow ? renderDrawer(selectedRow) : null}
            </div>
          </DrawerContent>
        </Drawer>
      ) : null}
    </div>
  )
}
