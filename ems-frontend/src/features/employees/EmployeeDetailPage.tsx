import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { motion } from 'framer-motion'
import { differenceInCalendarDays, formatDistanceToNowStrict, parseISO } from 'date-fns'
import { ChevronRight, Copy, Mail, Pencil, Phone, Trash2, UserX } from 'lucide-react'
import { toast } from 'sonner'
import { useCan } from '@/auth/use-auth'
import { Button } from '@/components/ui/button'
import { Avatar, Card, Skeleton } from '@/components/ui/misc'
import { PageBody, PageHeader } from '@/components/layout/PageHeader'
import { EmptyState, ErrorState } from '@/components/feedback/states'
import { fadeUp, stagger } from '@/components/feedback/motion'
import { formatCurrency, formatDate } from '@/lib/format'
import { initials } from '@/lib/utils'
import { useEmployee } from './api'
import { EmployeeSheet } from './EmployeeSheet'
import { DeleteEmployeeDialog } from './DeleteEmployeeDialog'
import { StatusBadge } from './StatusBadge'

export function EmployeeDetailPage() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const employee = useEmployee(id)
  const canEdit = useCan('employee:update')
  const canDelete = useCan('employee:delete')
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const crumb = (
    <span className="flex items-center gap-1">
      <Link to="/employees" className="hover:text-foreground">
        Employees
      </Link>
      <ChevronRight className="size-3" />
    </span>
  )

  if (employee.isPending) {
    return (
      <>
        <PageHeader eyebrow={crumb} title={<Skeleton className="h-6 w-48" />} description={<Skeleton className="mt-1 h-3 w-32" />} />
        <PageBody>
          <Skeleton className="h-64 w-full max-w-3xl" />
        </PageBody>
      </>
    )
  }

  if (employee.isError) {
    return employee.error && 'status' in employee.error && employee.error.status === 404 ? (
      <EmptyState
        icon={<UserX />}
        title="Employee not found"
        description="They may have been removed, or the link points to another organization."
        action={
          <Button asChild>
            <Link to="/employees">Back to employees</Link>
          </Button>
        }
      />
    ) : (
      <ErrorState error={employee.error} onRetry={() => employee.refetch()} />
    )
  }

  const e = employee.data
  const joined = parseISO(e.dateOfJoining)
  const tenure =
    differenceInCalendarDays(new Date(), joined) < 1
      ? 'joined today'
      : differenceInCalendarDays(new Date(), joined) < 30
        ? `${formatDistanceToNowStrict(joined, { unit: 'day' })} ago`
        : `${formatDistanceToNowStrict(joined, { roundingMethod: 'floor' })} with the team`

  const copy = (text: string, label: string) =>
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied`))

  return (
    <>
      <PageHeader
        eyebrow={crumb}
        title={
          <span className="flex items-center gap-3">
            <Avatar name={initials(e.firstName, e.lastName)} seed={e.id} className="size-10 rounded-lg text-sm" />
            <span className="min-w-0">
              <span className="block truncate">
                {e.firstName} {e.lastName}
              </span>
            </span>
          </span>
        }
        description={
          <span className="flex flex-wrap items-center gap-2">
            {e.jobTitle} <span className="text-subtle">·</span> <StatusBadge status={e.status} />
          </span>
        }
        actions={
          <>
            {canDelete && (
              <Button variant="danger-ghost" onClick={() => setConfirmDelete(true)}>
                <Trash2 /> Remove
              </Button>
            )}
            {canEdit && (
              <Button onClick={() => setEditOpen(true)}>
                <Pencil /> Edit
              </Button>
            )}
          </>
        }
      />

      <PageBody>
        <motion.div
          variants={stagger(0.05)}
          initial="hidden"
          animate="show"
          className="grid max-w-5xl gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"
        >
          <motion.div variants={fadeUp}>
            <Card>
              <h2 className="border-b border-border px-5 py-3 text-[13px] font-semibold">Details</h2>
              <dl className="divide-y divide-border">
                <Row label="Email">
                  <span className="flex items-center gap-2">
                    <a href={`mailto:${e.email}`} className="truncate hover:underline">
                      {e.email}
                    </a>
                    <IconAction label="Copy email" onClick={() => copy(e.email, 'Email')}>
                      <Copy />
                    </IconAction>
                  </span>
                </Row>
                <Row label="Phone">
                  {e.phone ? (
                    <a href={`tel:${e.phone}`} className="num hover:underline">
                      {e.phone}
                    </a>
                  ) : (
                    <span className="text-subtle">Not provided</span>
                  )}
                </Row>
                <Row label="Job title">{e.jobTitle}</Row>
                <Row label="Joined">
                  <span className="num">{formatDate(e.dateOfJoining)}</span>
                  <span className="ml-2 text-muted">· {tenure}</span>
                </Row>
              </dl>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col gap-4">
            <Card className="p-5">
              <p className="text-xs font-medium text-muted">Annual salary</p>
              <p className="num mt-1.5 text-[26px] font-semibold tracking-tight">{formatCurrency(e.salary)}</p>
              <p className="num mt-1 text-xs text-muted">≈ {formatCurrency(e.salary / 12)} / month</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs font-medium text-muted">Quick contact</p>
              <div className="mt-3 flex gap-2">
                <Button asChild size="sm">
                  <a href={`mailto:${e.email}`}>
                    <Mail /> Email
                  </a>
                </Button>
                {e.phone && (
                  <Button asChild size="sm">
                    <a href={`tel:${e.phone}`}>
                      <Phone /> Call
                    </a>
                  </Button>
                )}
              </div>
              <p className="mt-4 font-mono text-[11px] text-subtle">EMP-{String(e.id).padStart(5, '0')}</p>
            </Card>
          </motion.div>
        </motion.div>
      </PageBody>

      <EmployeeSheet open={editOpen} onOpenChange={setEditOpen} employee={e} />
      <DeleteEmployeeDialog
        employee={confirmDelete ? e : null}
        onClose={() => setConfirmDelete(false)}
        onDeleted={() => navigate('/employees', { replace: true })}
      />
    </>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-4 px-5 py-3 text-[13px] sm:grid-cols-[140px_minmax(0,1fr)]">
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
}

function IconAction({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="rounded p-1 text-subtle transition-colors hover:bg-surface-2 hover:text-foreground [&_svg]:size-3.5"
    >
      {children}
    </button>
  )
}
