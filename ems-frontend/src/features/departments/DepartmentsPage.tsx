import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence, motion } from 'framer-motion'
import { Building2, MoreHorizontal, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCan } from '@/auth/use-auth'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/misc'
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '@/components/ui/menu'
import { PageBody, PageHeader } from '@/components/layout/PageHeader'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { EmptyState, ErrorState } from '@/components/feedback/states'
import { ease } from '@/components/feedback/motion'
import { toApiError } from '@/lib/errors'
import { handleFormError } from '@/lib/forms'
import { formatDate, formatRelative } from '@/lib/format'
import type { Department } from '@/types/api'
import { useDeleteDepartment, useDepartments, useSaveDepartment } from './api'

export function DepartmentsPage() {
  const departments = useDepartments()
  const canCreate = useCan('department:create')
  const canUpdate = useCan('department:update')
  const canDelete = useCan('department:delete')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Department | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Department | null>(null)
  const remove = useDeleteDepartment()

  const list = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (departments.data ?? [])
      .filter((d) => d.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [departments.data, search])

  const confirmDelete = () =>
    deleting &&
    remove.mutate(deleting.id, {
      onSuccess: () => {
        toast.success(`${deleting.name} deleted`)
        setDeleting(null)
      },
      onError: (err) => {
        // The backend surfaces FK violations (department still in use) as a generic 500.
        const e = toApiError(err)
        toast.error(e.status >= 500 ? 'This department couldn’t be deleted — it may still be in use.' : e.message)
      },
    })

  return (
    <>
      <PageHeader
        title="Departments"
        description="How your organization is grouped."
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setEditing('new')}>
              <Plus /> New department
            </Button>
          )
        }
      />
      <PageBody>
        {departments.isPending ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[104px]" />
            ))}
          </div>
        ) : departments.isError ? (
          <ErrorState error={departments.error} onRetry={() => departments.refetch()} />
        ) : departments.data.length === 0 ? (
          <EmptyState
            icon={<Building2 />}
            title="No departments yet"
            description="Departments help you group people — Engineering, Finance, Operations…"
            action={
              canCreate && (
                <Button variant="primary" onClick={() => setEditing('new')}>
                  <Plus /> Create the first one
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="num text-xs text-muted">
                {list.length} of {departments.data.length}
              </p>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter departments…"
                leading={<Search />}
                className="h-8 w-full sm:w-64"
              />
            </div>
            <motion.ul layout className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence initial={false} mode="popLayout">
                {list.map((d, i) => (
                  <motion.li
                    key={d.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 12) * 0.025, duration: 0.25, ease } }}
                    exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
                    className="group relative flex flex-col justify-between rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-surface-2 font-mono text-[11px] font-medium text-muted ring-1 ring-inset ring-border">
                          {d.name.slice(0, 2).toUpperCase()}
                        </span>
                        <h3 className="truncate text-[14px] font-medium">{d.name}</h3>
                      </div>
                      {(canUpdate || canDelete) && (
                        <Menu>
                          <MenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="-mr-1.5 -mt-1 opacity-50 group-hover:opacity-100 data-[state=open]:opacity-100"
                              aria-label={`Actions for ${d.name}`}
                            >
                              <MoreHorizontal />
                            </Button>
                          </MenuTrigger>
                          <MenuContent>
                            {canUpdate && (
                              <MenuItem onSelect={() => setEditing(d)}>
                                <Pencil /> Rename
                              </MenuItem>
                            )}
                            {canUpdate && canDelete && <MenuSeparator />}
                            {canDelete && (
                              <MenuItem tone="danger" onSelect={() => setDeleting(d)}>
                                <Trash2 /> Delete
                              </MenuItem>
                            )}
                          </MenuContent>
                        </Menu>
                      )}
                    </div>
                    <div className="mt-5 flex items-center justify-between text-xs text-muted">
                      <span className="num">Created {formatDate(d.createdAt)}</span>
                      {d.updatedAt !== d.createdAt && <span>Edited {formatRelative(d.updatedAt)}</span>}
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
            {list.length === 0 && (
              <p className="py-12 text-center text-[13px] text-muted">No department matches “{search}”.</p>
            )}
          </>
        )}
      </PageBody>

      <DepartmentDialog target={editing} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete department?"
        description={
          <>
            <span className="font-medium text-foreground">{deleting?.name}</span> will be deleted. This can’t be undone.
          </>
        }
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />
    </>
  )
}

const schema = z.object({ name: z.string().trim().min(1, 'Give it a name').max(100, 'At most 100 characters') })

function DepartmentDialog({ target, onClose }: { target: Department | 'new' | null; onClose: () => void }) {
  const save = useSaveDepartment()
  const editing = target && target !== 'new' ? target : undefined
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { name: '' } })

  useEffect(() => {
    if (target) form.reset({ name: editing?.name ?? '' })
  }, [target, editing, form])

  const onSubmit = form.handleSubmit(({ name }) =>
    save.mutateAsync({ id: editing?.id, name }).then(
      (d) => {
        toast.success(editing ? 'Department renamed' : `${d.name} created`)
        onClose()
      },
      (err) => {
        if (toApiError(err).status === 409) form.setError('name', { message: 'A department with this name already exists' })
        else handleFormError(err, form.setError)
      },
    ),
  )

  return (
    <Dialog
      open={!!target}
      onOpenChange={(o) => !o && onClose()}
      title={editing ? 'Rename department' : 'New department'}
      description={editing ? undefined : 'Names are unique within your organization.'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="department-form" loading={save.isPending}>
            {editing ? 'Save' : 'Create'}
          </Button>
        </>
      }
    >
      <form id="department-form" onSubmit={onSubmit} noValidate>
        <Field label="Name" error={form.formState.errors.name?.message}>
          <Input autoFocus placeholder="e.g. Engineering" {...form.register('name')} />
        </Field>
      </form>
    </Dialog>
  )
}
