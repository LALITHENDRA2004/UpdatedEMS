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
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize })

  const table = useTable({
    features: tableFeatureSet,
    columns,
    data,
    getRowId: (row) => getRowId(row),
    state: { sorting, pagination, globalFilter },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    globalFilterFn: 'includesString',
    enableSortingRemoval: false,
  })

  const rows = table.getRowModel().rows
  const total = table.getPrePaginatedRowModel().rows.length
  const { pageIndex } = table.state.pagination
  const from = total === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min(total, (pageIndex + 1) * pageSize)

  if (total === 0) return <>{empty}</>

  return (
    <div>
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
                        'h-9 whitespace-nowrap px-3 text-left text-xs font-medium text-muted first:pl-4 last:pr-4 md:first:pl-8 md:last:pr-8',
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
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(
                    'group border-b border-border last:border-0 transition-colors hover:bg-surface-2/60',
                    onRowClick && 'cursor-pointer',
                  )}
                >
                  {row.getAllCells().map((cell) => {
                    const meta = cell.column.columnDef.meta
                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          'h-12 px-3 align-middle first:pl-4 last:pr-4 md:first:pl-8 md:last:pr-8',
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
        <span className="num">
          {from}–{to} of {total}
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
