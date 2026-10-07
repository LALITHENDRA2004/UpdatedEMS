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
import { ease, spring } from '@/components/feedback/motion'
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

  const groups = useMemo(() => {
    const map = new Map<string, Department[]>()
    for (const d of list) {
      const letter = /[a-z]/i.test(d.name[0]) ? d.name[0].toUpperCase() : '#'
      map.set(letter, [...(map.get(letter) ?? []), d])
    }
    return [...map.entries()]
  }, [list])

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
        description="The teams your people belong to, listed A to Z."
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setEditing('new')}>
              <Plus /> Add department
            </Button>
          )
        }
      />
      <PageBody>
        {departments.isPending ? (
          <div className="grid gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[52px]" />
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
                  <Plus /> Add department
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
            {/* Card-catalog index: departments grouped under their initial letter. */}
            <div className="overflow-hidden rounded-lg border border-border">
              <AnimatePresence initial={false} mode="popLayout">
                {groups.map(([letter, items]) => (
                  <motion.section
                    key={letter}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, layout: spring.snappy }}
                    className="grid grid-cols-[56px_minmax(0,1fr)] border-b border-border last:border-0"
                    aria-label={`Departments starting with ${letter}`}
                  >
                    <div className="border-r border-border bg-surface-2/60 pt-3.5 text-center font-display text-[17px] font-semibold text-muted">
                      {letter}
                    </div>
                    <ul>
                      <AnimatePresence initial={false} mode="popLayout">
                        {items.map((d) => (
                          <motion.li
                            key={d.id}
                            layout
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -12, transition: { duration: 0.15 } }}
                            transition={{ duration: 0.22, ease, layout: spring.snappy }}
                            className="group flex min-h-[52px] items-center gap-4 border-b border-border px-4 last:border-0 transition-[background-color,box-shadow] duration-150 hover:bg-surface-2/60 hover:shadow-[inset_3px_0_0_var(--manila)]"
                          >
                            <h3 className="min-w-0 flex-1 truncate font-display text-[16px] font-medium">{d.name}</h3>
                            <span className="hidden text-xs text-muted sm:block">
                              {d.updatedAt !== d.createdAt
                                ? `Renamed ${formatRelative(d.updatedAt)}`
                                : `Added ${formatDate(d.createdAt)}`}
                            </span>
                            {(canUpdate || canDelete) && (
                              <Menu>
                                <MenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="opacity-60 group-hover:opacity-100 data-[state=open]:opacity-100"
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
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  </motion.section>
                ))}
              </AnimatePresence>
            </div>
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
        toast.success(editing ? 'Department renamed' : `${d.name} added`)
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
      title={editing ? 'Rename department' : 'Add department'}
      description={editing ? undefined : 'Names are unique within your organization.'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="department-form" loading={save.isPending}>
            {editing ? 'Rename' : 'Add department'}
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
