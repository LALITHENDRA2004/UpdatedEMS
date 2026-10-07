import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { MoreHorizontal, Pencil, Plus, Search, Trash2, Users, X } from 'lucide-react'
import { useCan } from '@/auth/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/misc'
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger, Select } from '@/components/ui/menu'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, columnHelper, type Columns } from '@/components/data-table/DataTable'
import { TableSkeleton } from '@/components/data-table/TableSkeleton'
import { EmptyState, ErrorState } from '@/components/feedback/states'
import { spring } from '@/components/feedback/motion'
import { formatCurrency, formatDate, STATUS_LABEL } from '@/lib/format'
import { useDebouncedValue } from '@/lib/use-debounced'
import { cn, initials } from '@/lib/utils'
import {
  EMPLOYEE_SORT_FIELDS,
  EMPLOYEE_STATUSES,
  type Employee,
  type EmployeeSortField,
  type EmployeeStatus,
} from '@/types/api'
import { useDepartments } from '@/features/departments/api'
import { useEmployeePage, useEmployeeStatusCounts } from './api'
import { EmployeeSheet } from './EmployeeSheet'
import { DeleteEmployeeDialog } from './DeleteEmployeeDialog'
import { StatusBadge } from './StatusBadge'

const h = columnHelper<Employee>()
const PAGE_SIZES = [10, 20, 50, 100]
const ALL_DEPARTMENTS = '__all'

/** Reads list state from the URL so pages, filters and sort survive refresh and the back button. */
function useListParams() {
  const [params, setParams] = useSearchParams()
  const statusParam = params.get('status')
  const sortParam = params.get('sort')
  const state = {
    q: params.get('q') ?? '',
    department: params.get('department') ?? '',
    status: (EMPLOYEE_STATUSES as readonly string[]).includes(statusParam ?? '') ? (statusParam as EmployeeStatus) : undefined,
    page: Math.max(0, Number(params.get('page') ?? 1) - 1) || 0,
    size: Math.min(100, Math.max(1, Number(params.get('size')) || 20)),
    sort: (EMPLOYEE_SORT_FIELDS as readonly string[]).includes(sortParam ?? '') ? (sortParam as EmployeeSortField) : 'firstName',
    dir: params.get('dir') === 'desc' ? ('desc' as const) : ('asc' as const),
  }
  /** Merge updates; any filter change sends you back to the first page. */
  const update = (patch: Partial<Record<'q' | 'department' | 'status' | 'page' | 'size' | 'sort' | 'dir' | 'new', string | undefined>>, opts: { replace?: boolean } = {}) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p)
        for (const [k, v] of Object.entries(patch)) {
          if (v === undefined || v === '') next.delete(k)
          else next.set(k, v)
        }
        if (!('page' in patch)) next.delete('page')
        return next
      },
      { replace: opts.replace },
    )
  return { state, update, params }
}

export function EmployeesPage() {
  const navigate = useNavigate()
  const { state, update, params } = useListParams()
  const canCreate = useCan('employee:create')
  const canEdit = useCan('employee:update')
  const canDelete = useCan('employee:delete')
  const departments = useDepartments()

  // The search box is local for instant typing; the URL (and the request) follow after a pause.
  const [search, setSearch] = useState(state.q)
  const debouncedSearch = useDebouncedValue(search.trim(), 300)
  // Follow the URL when it changes from elsewhere (back button, "Clear filters").
  const [urlQ, setUrlQ] = useState(state.q)
  if (state.q !== urlQ) {
    setUrlQ(state.q)
    if (state.q !== search.trim()) setSearch(state.q)
  }
  useEffect(() => {
    if (debouncedSearch !== state.q) update({ q: debouncedSearch }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const query = {
    name: state.q,
    department: state.department,
    status: state.status,
    page: state.page,
    size: state.size,
    sort: state.sort,
    direction: state.dir,
  }
  const employees = useEmployeePage(query)
  const counts = useEmployeeStatusCounts({ name: state.q, department: state.department })
  const page = employees.data

  // Deleting the last row on the last page leaves you past the end: step back to the real last page.
  useEffect(() => {
    if (page && page.totalPages > 0 && state.page > page.totalPages - 1) {
      update({ page: page.totalPages > 1 ? String(page.totalPages) : undefined }, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page?.totalPages, state.page])

  const [editing, setEditing] = useState<Employee | undefined>()
  const [deleting, setDeleting] = useState<Employee | null>(null)
  // ?new=1 (from the command menu or dashboard) opens the create sheet.
  const sheetOpen = !!editing || (params.get('new') === '1' && canCreate)
  const closeSheet = () => {
    setEditing(undefined)
    if (params.has('new')) update({ new: undefined, page: state.page ? String(state.page + 1) : undefined }, { replace: true })
  }

  const filtered = !!(state.q || state.department || state.status)
  const clearFilters = () => {
    setSearch('')
    update({ q: undefined, department: undefined, status: undefined })
  }

  const columns = useMemo<Columns<Employee>>(
    () =>
      h.columns([
        // Column ids match the backend's sort fields, so sorting maps straight onto `?sort=`.
        h.accessor('firstName', {
          header: 'Name',
          cell: ({ row: { original: e } }) => (
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={initials(e.firstName, e.lastName)} seed={e.id} viewTransitionName={`emp-${e.id}`} />
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {e.firstName} {e.lastName}
                </p>
                <p className="truncate text-xs text-muted">{e.email}</p>
              </div>
            </div>
          ),
        }),
        h.accessor('jobTitle', { header: 'Title', enableSorting: false, meta: { className: 'text-muted' } }),
        h.accessor('departmentName', {
          header: 'Department',
          enableSorting: false,
          cell: (c) => c.getValue() ?? <span className="text-subtle">None</span>,
        }),
        h.accessor('status', {
          header: 'Status',
          cell: (c) => <StatusBadge status={c.getValue()} />,
        }),
        h.accessor('dateOfJoining', {
          header: 'Joined',
          meta: { className: 'num text-muted whitespace-nowrap' },
          cell: (c) => formatDate(c.getValue()),
        }),
        h.accessor('salary', {
          header: 'Salary',
          meta: { align: 'end', className: 'num whitespace-nowrap' },
          cell: (c) => formatCurrency(c.getValue()),
        }),
        h.display({
          id: 'actions',
          header: () => <span className="sr-only">Actions</span>,
          meta: { className: 'w-12' },
          cell: ({ row: { original: e } }) =>
            canEdit || canDelete ? (
              <div onClick={(ev) => ev.stopPropagation()} className="flex justify-end">
                <Menu>
                  <MenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Actions for ${e.firstName}`}
                      className="opacity-60 group-hover:opacity-100 data-[state=open]:opacity-100"
                    >
                      <MoreHorizontal />
                    </Button>
                  </MenuTrigger>
                  <MenuContent>
                    {canEdit && (
                      <MenuItem onSelect={() => setEditing(e)}>
                        <Pencil /> Edit details
                      </MenuItem>
                    )}
                    {canEdit && canDelete && <MenuSeparator />}
                    {canDelete && (
                      <MenuItem tone="danger" onSelect={() => setDeleting(e)}>
                        <Trash2 /> Remove
                      </MenuItem>
                    )}
                  </MenuContent>
                </Menu>
              </div>
            ) : null,
        }),
      ]),
    [canEdit, canDelete],
  )

  const total = counts.ALL
  const departmentOptions = [
    { value: ALL_DEPARTMENTS, label: 'All departments' },
    ...(departments.data ?? [])
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((d) => ({ value: d.name, label: d.name })),
  ]

  return (
    <>
      <PageHeader
        title="Employees"
        description={
          total === undefined ? ' ' : filtered ? `${total} ${total === 1 ? 'match' : 'matches'}` : `${total} ${total === 1 ? 'person' : 'people'} on the roster`
        }
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => update({ new: '1', page: state.page ? String(state.page + 1) : undefined })}>
              <Plus /> Add employee
            </Button>
          )
        }
      />

      {/* Toolbar */}
      <div className="relative flex flex-col gap-3 border-b border-border px-4 py-3 lg:flex-row lg:items-center lg:justify-between md:px-8">
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1">
          {(['ALL', ...EMPLOYEE_STATUSES] as const)
            .filter((s) => s === 'ALL' || (counts[s] ?? 0) > 0 || s === state.status)
            .map((s) => {
              const active = (state.status ?? 'ALL') === s
              return (
                <button
                  key={s}
                  onClick={() => update({ status: s === 'ALL' ? undefined : s })}
                  aria-pressed={active}
                  className={cn(
                    'relative inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium transition-colors',
                    active ? 'text-foreground' : 'text-muted hover:text-foreground',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="employee-status-filter"
                      className="absolute inset-0 rounded-md bg-surface-2 ring-1 ring-inset ring-border-strong"
                      transition={spring.indicator}
                    />
                  )}
                  <span className="relative">{s === 'ALL' ? 'All' : STATUS_LABEL[s]}</span>
                  <span className="num relative text-xs text-subtle">{counts[s] ?? ''}</span>
                </button>
              )
            })}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            value={state.department || ALL_DEPARTMENTS}
            onValueChange={(v) => update({ department: v === ALL_DEPARTMENTS ? undefined : v })}
            options={departmentOptions}
            className="h-8 sm:w-48"
            aria-label="Filter by department"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name"
            aria-label="Search by first or last name"
            leading={<Search />}
            trailing={
              search && (
                <Button variant="ghost" size="icon-sm" className="size-6" onClick={() => setSearch('')} aria-label="Clear search">
                  <X />
                </Button>
              )
            }
            className="h-8 sm:w-64"
          />
        </div>
        {/* Thin progress line while a new page or filter result is loading. */}
        <AnimatePresence>
          {employees.isFetching && !employees.isPending && (
            <motion.span
              aria-hidden
              className="absolute inset-x-0 -bottom-px h-0.5 origin-left bg-manila"
              initial={{ scaleX: 0, opacity: 1 }}
              animate={{ scaleX: 0.85, transition: { duration: 1.2, ease: [0.1, 0.7, 0.3, 1] } }}
              exit={{ scaleX: 1, opacity: 0, transition: { duration: 0.25 } }}
            />
          )}
        </AnimatePresence>
      </div>

      {employees.isPending ? (
        <TableSkeleton cols={6} />
      ) : employees.isError ? (
        <ErrorState error={employees.error} onRetry={() => employees.refetch()} />
      ) : (
        <DataTable
          data={page!.content}
          columns={columns}
          getRowId={(e) => String(e.id)}
          onRowClick={(e) => navigate(`/employees/${e.id}`, { viewTransition: true })}
          server={{
            rowCount: page!.totalElements,
            sorting: [{ id: state.sort, desc: state.dir === 'desc' }],
            onSortingChange: (s) => {
              const first = s[0]
              if (first) update({ sort: first.id === 'firstName' ? undefined : first.id, dir: first.desc ? 'desc' : undefined })
            },
            pagination: { pageIndex: state.page, pageSize: state.size },
            onPaginationChange: (p) =>
              update({
                page: p.pageIndex > 0 ? String(p.pageIndex + 1) : undefined,
                size: p.pageSize === 20 ? undefined : String(p.pageSize),
              }),
            fetching: employees.isPlaceholderData,
            pageSizeOptions: PAGE_SIZES,
          }}
          renderMobile={(e) => (
            <div className="flex items-center gap-3">
              <Avatar name={initials(e.firstName, e.lastName)} seed={e.id} className="size-9" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">
                  {e.firstName} {e.lastName}
                </p>
                <p className="truncate text-xs text-muted">
                  {e.jobTitle}
                  {e.departmentName && `, ${e.departmentName}`}
                </p>
              </div>
              <StatusBadge status={e.status} />
            </div>
          )}
          empty={
            filtered ? (
              <EmptyState
                icon={<Search />}
                title="No one matches"
                description="Search looks at first and last names. Try fewer letters, or clear the filters."
                action={<Button onClick={clearFilters}>Clear filters</Button>}
              />
            ) : (
              <EmptyState
                icon={<Users />}
                title="No employees yet"
                description="Add the first person to start your roster. You can edit their details any time."
                action={
                  canCreate && (
                    <Button variant="primary" onClick={() => update({ new: '1' })}>
                      <Plus /> Add employee
                    </Button>
                  )
                }
              />
            )
          }
        />
      )}

      <EmployeeSheet open={sheetOpen} onOpenChange={(o) => !o && closeSheet()} employee={editing} />
      <DeleteEmployeeDialog employee={deleting} onClose={() => setDeleting(null)} />
    </>
  )
}
