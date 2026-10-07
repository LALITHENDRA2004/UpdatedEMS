import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { differenceInCalendarDays, formatDistanceToNowStrict, parseISO } from 'date-fns'
import { Check, ChevronLeft, Copy, Pencil, Trash2, UserX } from 'lucide-react'
import { useCan } from '@/auth/use-auth'
import { Button } from '@/components/ui/button'
import { Avatar, Skeleton } from '@/components/ui/misc'
import { EmptyState, ErrorState } from '@/components/feedback/states'
import { ease, useCountUp } from '@/components/feedback/motion'
import { formatCurrency, formatDate, STATUS_LABEL } from '@/lib/format'
import { initials } from '@/lib/utils'
import { useEmployee } from './api'
import { EmployeeSheet } from './EmployeeSheet'
import { DeleteEmployeeDialog } from './DeleteEmployeeDialog'
import { StatusBadge } from './StatusBadge'

const fileNumber = (id: number) => String(id).padStart(4, '0')

export function EmployeeDetailPage() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const employee = useEmployee(id)
  const canEdit = useCan('employee:update')
  const canDelete = useCan('employee:delete')
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const back = (
    <Link
      to="/employees"
      viewTransition
      className="inline-flex items-center gap-1 text-[13px] text-muted transition-colors hover:text-foreground"
    >
      <ChevronLeft className="size-4" /> All employees
    </Link>
  )

  if (employee.isPending) {
    return (
      <div className="px-4 py-6 md:px-8 md:py-8">
        {back}
        <Skeleton className="mt-8 h-72 w-full max-w-5xl rounded-xl" />
      </div>
    )
  }

  if (employee.isError) {
    const notFound = 'status' in employee.error && employee.error.status === 404
    return notFound ? (
      <EmptyState
        icon={<UserX />}
        title="No file for this person"
        description="They may have been removed, or the link belongs to another organization."
        action={
          <Button asChild>
            <Link to="/employees" viewTransition>
              Back to employees
            </Link>
          </Button>
        }
      />
    ) : (
      <ErrorState error={employee.error} onRetry={() => employee.refetch()} />
    )
  }

  const e = employee.data
  const joined = parseISO(e.dateOfJoining)
  const days = differenceInCalendarDays(new Date(), joined)
  const tenure =
    days < 1
      ? 'Started today'
      : days < 30
        ? `${formatDistanceToNowStrict(joined, { unit: 'day' })} in`
        : `${formatDistanceToNowStrict(joined, { roundingMethod: 'floor' })} with the team`

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      {back}

      {/* The personnel file: a manila tab carrying the file number, attached to the folder body. */}
      <article className="mt-8 max-w-5xl">
        <div className="relative z-10 -mb-px inline-flex items-center gap-2 rounded-t-lg border border-b-0 border-manila bg-manila px-4 pb-1.5 pt-2 text-xs font-semibold text-[#3d2f08]">
          File <span className="num">No. {fileNumber(e.id)}</span>
        </div>
        <div className="rounded-xl rounded-tl-none border border-border-strong bg-surface shadow-[0_1px_0_var(--manila)_inset,0_8px_24px_-16px_rgb(28_39_51/0.25)]">
          <header className="flex flex-col gap-5 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
            <div className="flex min-w-0 items-center gap-5">
              <Avatar
                name={initials(e.firstName, e.lastName)}
                seed={e.id}
                className="size-[72px] rounded-xl text-xl"
                viewTransitionName={`emp-${e.id}`}
              />
              <div className="min-w-0">
                <motion.h1
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease, delay: 0.05 }}
                  className="truncate font-display text-[34px] font-semibold leading-[1.05]"
                >
                  {e.firstName} {e.lastName}
                </motion.h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[14px] text-muted">
                  <span>
                    {e.jobTitle}
                    {e.departmentName && <span className="text-subtle"> in </span>}
                    {e.departmentName}
                  </span>
                  <StatusBadge status={e.status} />
                </div>
              </div>
            </div>
            {(canEdit || canDelete) && (
              <div className="flex shrink-0 gap-2">
                {canDelete && (
                  <Button variant="danger-ghost" onClick={() => setConfirmDelete(true)}>
                    <Trash2 /> Remove
                  </Button>
                )}
                {canEdit && (
                  <Button onClick={() => setEditOpen(true)}>
                    <Pencil /> Edit details
                  </Button>
                )}
              </div>
            )}
          </header>

          <div className="grid divide-y divide-border lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            <FileSection title="Contact">
              <Field label="Email">
                <span className="flex min-w-0 items-center gap-1.5">
                  <a href={`mailto:${e.email}`} className="truncate underline-offset-4 hover:underline">
                    {e.email}
                  </a>
                  <CopyButton value={e.email} label="Copy email" />
                </span>
              </Field>
              <Field label="Phone">
                {e.phone ? (
                  <a href={`tel:${e.phone}`} className="num underline-offset-4 hover:underline">
                    {e.phone}
                  </a>
                ) : (
                  <span className="text-subtle">Not on file</span>
                )}
              </Field>
            </FileSection>

            <FileSection title="Pay">
              <Field label="Annual salary">
                <Salary value={e.salary} />
              </Field>
              <Field label="Per month">
                <span className="num">{formatCurrency(e.salary / 12)}</span>
              </Field>
            </FileSection>

            <FileSection title="Record">
              <Field label="Department">
                {e.departmentName ?? <span className="text-subtle">Not assigned</span>}
              </Field>
              <Field label="Joined">
                <span className="num">{formatDate(e.dateOfJoining)}</span>
              </Field>
              <Field label="Tenure">{tenure}</Field>
              <Field label="Status">{STATUS_LABEL[e.status]}</Field>
            </FileSection>
          </div>
        </div>
      </article>

      <EmployeeSheet open={editOpen} onOpenChange={setEditOpen} employee={e} />
      <DeleteEmployeeDialog
        employee={confirmDelete ? e : null}
        onClose={() => setConfirmDelete(false)}
        onDeleted={() => navigate('/employees', { replace: true, viewTransition: true })}
      />
    </div>
  )
}

function FileSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="p-6 md:px-8">
      <h2 className="font-display text-[15px] font-semibold">{title}</h2>
      <dl className="mt-3">{children}</dl>
    </section>
  )
}

/** A ruled form line: label above, value below, hairline between lines. */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-b border-dashed border-border py-3 last:border-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 min-w-0 text-[14px]">{children}</dd>
    </div>
  )
}

/** Animates when the salary changes after an edit, so the update is visible. */
function Salary({ value }: { value: number }) {
  const shown = useCountUp(value) ?? value
  return <span className="num font-display text-[22px] font-semibold">{formatCurrency(shown)}</span>
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={copy}
      aria-label={copied ? 'Copied' : label}
      className="relative grid size-6 shrink-0 place-items-center rounded text-subtle transition-colors hover:bg-surface-2 hover:text-foreground"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={copied ? 'done' : 'copy'}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.15 }}
          className="flex [&_svg]:size-3.5"
        >
          {copied ? <Check className="text-success" /> : <Copy />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
