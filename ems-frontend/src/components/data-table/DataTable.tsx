import { useState, type ReactNode } from 'react'
import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  metaHelper,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
  type ColumnDef,
  type PaginationState,
  type RowData,
  type SortingState,
} from '@tanstack/react-table'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { spring } from '@/components/feedback/motion'

interface ColumnMeta {
  /** Applied to both th and td. */
  className?: string
  align?: 'end'
}

/** One feature set for every client-side table in the app (backend lists are unpaginated arrays). */
export const tableFeatureSet = tableFeatures({
  columnMeta: metaHelper<ColumnMeta>(),
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text, datetime: sortFn_datetime, basic: sortFn_basic },
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
})

export type Features = typeof tableFeatureSet
export const columnHelper = <T extends RowData>() => createColumnHelper<Features, T>()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Columns<T extends RowData> = ColumnDef<Features, T, any>[]

interface DataTableProps<T extends RowData> {
  data: T[]
  columns: Columns<T>
  globalFilter?: string
  initialSorting?: SortingState
  pageSize?: number
  getRowId: (row: T) => string
  onRowClick?: (row: T) => void
  /** Card renderer used below the md breakpoint instead of the table. */
  renderMobile?: (row: T) => ReactNode
  empty: ReactNode
  /**
   * Server-driven mode: `data` is already one sorted page. Sorting and paging are controlled
   * by the caller (who fetches), and `rowCount` is the server's total.
   */
  server?: {
    rowCount: number
    sorting: SortingState
    onSortingChange: (s: SortingState) => void
    pagination: PaginationState
    onPaginationChange: (p: PaginationState) => void
    /** True while a new page is loading; the current rows dim instead of disappearing. */
    fetching?: boolean
    pageSizeOptions?: number[]
  }
}

export function DataTable<T extends RowData>({
  data,
  columns,
  globalFilter = '',
  initialSorting = [],
  pageSize = 20,
  getRowId,
  onRowClick,
  renderMobile,
  empty,
  server,
}: DataTableProps<T>) {
  const [localSorting, setLocalSorting] = useState<SortingState>(initialSorting)
  const [localPagination, setLocalPagination] = useState<PaginationState>({ pageIndex: 0, pageSize })
  const sorting = server?.sorting ?? localSorting
  const pagination = server?.pagination ?? localPagination

  const table = useTable({
    features: tableFeatureSet,
    columns,
    data,
    getRowId: (row) => getRowId(row),
    state: { sorting, pagination, globalFilter },
    onSortingChange: (u) => {
      const next = typeof u === 'function' ? u(sorting) : u
      if (server) server.onSortingChange(next)
      else setLocalSorting(next)
    },
    onPaginationChange: (u) => {
      const next = typeof u === 'function' ? u(pagination) : u
      if (server) server.onPaginationChange(next)
      else setLocalPagination(next)
    },
    globalFilterFn: 'includesString',
    enableSortingRemoval: false,
    manualSorting: !!server,
    manualPagination: !!server,
    manualFiltering: !!server,
    rowCount: server?.rowCount,
    autoResetPageIndex: !server,
  })

  const rows = table.getRowModel().rows
  const total = server ? server.rowCount : table.getPrePaginatedRowModel().rows.length
  const { pageIndex, pageSize: size } = table.state.pagination
  const from = total === 0 ? 0 : pageIndex * size + 1
  const to = Math.min(total, (pageIndex + 1) * size)

  if (total === 0) return <>{empty}</>

  return (
    <div
      aria-busy={server?.fetching || undefined}
      className={cn('transition-opacity duration-200', server?.fetching && 'opacity-60')}
    >
      {/* Desktop table */}
      <div className={cn('overflow-x-auto', renderMobile && 'hidden md:block')}>
        <table className="w-full border-collapse text-[13px]">
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id} className="border-b border-border">
                {group.headers.map((header) => {
                  const meta = header.column.columnDef.meta
                  const sorted = header.column.getIsSorted()
                  const canSort = header.column.getCanSort()
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        'h-10 whitespace-nowrap bg-surface-2/50 px-3 text-left text-xs font-medium text-muted first:pl-4 last:pr-4 md:first:pl-8 md:last:pr-8',
                        meta?.align === 'end' && 'text-right',
                        meta?.className,
                      )}
                      aria-sort={sorted ? (sorted === 'asc' ? 'ascending' : 'descending') : undefined}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            'group -mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 hover:text-foreground',
                            sorted && 'text-foreground',
                            meta?.align === 'end' && 'flex-row-reverse',
                          )}
                        >
                          <table.FlexRender header={header} />
                          {sorted === 'asc' ? (
                            <ArrowUp className="size-3" />
                          ) : sorted === 'desc' ? (
                            <ArrowDown className="size-3" />
                          ) : (
                            <ChevronsUpDown className="size-3 opacity-0 transition-opacity group-hover:opacity-60" />
                          )}
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {rows.map((row) => (
                <motion.tr
                  key={row.id}
                  layout="position"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -12, transition: { duration: 0.18 } }}
                  transition={{ duration: 0.2, layout: spring.snappy }}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(
                    // A manila edge marks the row under the pointer, like a tabbed file being pulled.
                    'group border-b border-border last:border-0 transition-[background-color] duration-150 hover:bg-surface-2/70',
                    '[&>td:first-child]:transition-[box-shadow] [&>td:first-child]:duration-150 hover:[&>td:first-child]:shadow-[inset_3px_0_0_var(--manila)]',
                    onRowClick && 'cursor-pointer',
                  )}
                >
                  {row.getAllCells().map((cell) => {
                    const meta = cell.column.columnDef.meta
                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          'h-[52px] px-3 align-middle first:pl-4 last:pr-4 md:first:pl-8 md:last:pr-8',
                          meta?.align === 'end' && 'text-right',
                          meta?.className,
                        )}
                      >
                        <table.FlexRender cell={cell} />
                      </td>
                    )
                  })}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      {renderMobile && (
        <ul className="divide-y divide-border md:hidden">
          {rows.map((row) => (
            <li
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              className={cn('px-4 py-3', onRowClick && 'cursor-pointer active:bg-surface-2')}
            >
              {renderMobile(row.original)}
            </li>
          ))}
        </ul>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted md:px-8">
        <span className="flex items-center gap-4">
          <span className="num">
            {from}–{to} of {total}
          </span>
          {server?.pageSizeOptions && (
            <label className="hidden items-center gap-2 sm:flex">
              Rows per page
              <select
                value={size}
                onChange={(e) => server.onPaginationChange({ pageIndex: 0, pageSize: Number(e.target.value) })}
                className="num h-7 rounded-md border border-border-strong bg-surface px-1.5 text-xs text-foreground"
              >
                {[...new Set([...server.pageSizeOptions, size])].sort((a, b) => a - b).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          )}
        </span>
        {table.getPageCount() > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
            >
              <ChevronLeft />
            </Button>
            <span className="num px-1">
              {pageIndex + 1} / {table.getPageCount()}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
            >
              <ChevronRight />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
