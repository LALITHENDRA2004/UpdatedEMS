import { useDeferredValue, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { MoreHorizontal, Pencil, Plus, Search, Trash2, Users, X } from 'lucide-react'
import { useCan } from '@/auth/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/misc'
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '@/components/ui/menu'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, columnHelper, type Columns } from '@/components/data-table/DataTable'
import { TableSkeleton } from '@/components/data-table/TableSkeleton'
import { EmptyState, ErrorState } from '@/components/feedback/states'
import { formatCurrency, formatDate, STATUS_LABEL } from '@/lib/format'
import { cn, initials } from '@/lib/utils'
import { EMPLOYEE_STATUSES, type Employee, type EmployeeStatus } from '@/types/api'
import { useEmployees } from './api'
import { EmployeeSheet } from './EmployeeSheet'
import { DeleteEmployeeDialog } from './DeleteEmployeeDialog'
import { StatusBadge } from './StatusBadge'

const h = columnHelper<Employee>()

export function EmployeesPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const employees = useEmployees()
  const canCreate = useCan('employee:create')
  const canEdit = useCan('employee:update')
  const canDelete = useCan('employee:delete')

  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [status, setStatus] = useState<EmployeeStatus | 'ALL'>('ALL')
  const [editing, setEditing] = useState<Employee | undefined>()
  const [deleting, setDeleting] = useState<Employee | null>(null)

  // ?new=1 (from the command menu) opens the create sheet.
  const sheetOpen = !!editing || (params.get('new') === '1' && canCreate)
  const closeSheet = () => {
    setEditing(undefined)
    if (params.has('new')) setParams((p) => (p.delete('new'), p), { replace: true })
  }

  const all = employees.data
  const counts = useMemo(() => {
    const c = { ALL: all?.length ?? 0 } as Record<EmployeeStatus | 'ALL', number>
    for (const s of EMPLOYEE_STATUSES) c[s] = 0
    all?.forEach((e) => c[e.status]++)
    return c
  }, [all])
  const rows = useMemo(() => (status === 'ALL' ? (all ?? []) : (all ?? []).filter((e) => e.status === status)), [all, status])

  const columns = useMemo<Columns<Employee>>(
    () =>
      h.columns([
        h.accessor((e) => `${e.firstName} ${e.lastName} ${e.email}`, {
          id: 'name',
          header: 'Name',
          sortFn: 'text',
          cell: ({ row: { original: e } }) => (
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={initials(e.firstName, e.lastName)} seed={e.id} />
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {e.firstName} {e.lastName}
                </p>
                <p className="truncate text-xs text-muted">{e.email}</p>
              </div>
            </div>
          ),
        }),
        h.accessor('jobTitle', { header: 'Title', sortFn: 'text', meta: { className: 'text-muted' } }),
        h.accessor('status', {
          header: 'Status',
          enableGlobalFilter: false,
          cell: (c) => <StatusBadge status={c.getValue()} />,
        }),
        h.accessor('dateOfJoining', {
          header: 'Joined',
          sortFn: 'alphanumeric',
          enableGlobalFilter: false,
          meta: { className: 'num text-muted whitespace-nowrap' },
          cell: (c) => formatDate(c.getValue()),
        }),
        h.accessor('salary', {
          header: 'Salary',
          sortFn: 'basic',
          enableGlobalFilter: false,
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

  return (
    <>
      <PageHeader
        title="Employees"
        description={
          employees.data ? `${employees.data.length} ${employees.data.length === 1 ? 'person' : 'people'} on the roster` : ' '
        }
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setParams({ new: '1' })}>
              <Plus /> New employee
            </Button>
          )
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1">
          {(['ALL', ...EMPLOYEE_STATUSES] as const)
            .filter((s) => s === 'ALL' || counts[s] > 0 || s === status)
            .map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium transition-colors',
                  status === s ? 'bg-surface-2 text-foreground ring-1 ring-border' : 'text-muted hover:text-foreground',
                )}
              >
                {s === 'ALL' ? 'All' : STATUS_LABEL[s]}
                <span className="num text-xs text-subtle">{counts[s]}</span>
              </button>
            ))}
        </div>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, title…"
          leading={<Search />}
          trailing={
            search && (
              <Button variant="ghost" size="icon-sm" className="size-6" onClick={() => setSearch('')} aria-label="Clear search">
                <X />
              </Button>
            )
          }
          className="h-8 sm:w-72"
        />
      </div>

      {employees.isPending ? (
        <TableSkeleton cols={5} />
      ) : employees.isError ? (
        <ErrorState error={employees.error} onRetry={() => employees.refetch()} />
      ) : (
        <DataTable
          data={rows}
          columns={columns}
          globalFilter={deferredSearch}
          initialSorting={[{ id: 'name', desc: false }]}
          getRowId={(e) => String(e.id)}
          onRowClick={(e) => navigate(`/employees/${e.id}`)}
          renderMobile={(e) => (
            <div className="flex items-center gap-3">
              <Avatar name={initials(e.firstName, e.lastName)} seed={e.id} className="size-9" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">
                  {e.firstName} {e.lastName}
                </p>
                <p className="truncate text-xs text-muted">{e.jobTitle}</p>
              </div>
              <StatusBadge status={e.status} />
            </div>
          )}
          empty={
            all && all.length > 0 ? (
              <EmptyState
                icon={<Search />}
                title="No matches"
                description="Nobody fits the current search or filter."
                action={
                  <Button
                    onClick={() => {
                      setSearch('')
                      setStatus('ALL')
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={<Users />}
                title="No employees yet"
                description="Add the first person to start building your roster."
                action={
                  canCreate && (
                    <Button variant="primary" onClick={() => setParams({ new: '1' })}>
                      <Plus /> New employee
                    </Button>
                  )
                }
              />
            )
          }
        />
      )}

      <EmployeeSheet
        open={sheetOpen}
        onOpenChange={(o) => !o && closeSheet()}
        employee={editing}
      />
      <DeleteEmployeeDialog employee={deleting} onClose={() => setDeleting(null)} />
    </>
  )
}
