import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Plus, UserPlus, Users } from 'lucide-react'
import { useCan } from '@/auth/use-auth'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/misc'
import { PageBody, PageHeader } from '@/components/layout/PageHeader'
import { EmptyState, ErrorState } from '@/components/feedback/states'
import { ease, spring, useCountUp } from '@/components/feedback/motion'
import { useAllEmployees } from '@/features/employees/api'
import { useDepartments } from '@/features/departments/api'
import { useUsers } from '@/features/team/api'
import { useMyOrganization } from '@/features/settings/api'
import { formatCurrencyCompact } from '@/lib/format'
import { cn } from '@/lib/utils'
import { hiresByMonth, salaryBands, type MonthBucket, type SalaryBand } from './metrics'
import { RosterWall } from './RosterWall'

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

export function DashboardPage() {
  const org = useMyOrganization()
  const canSeeUsers = useCan('user:list')
  const canCreate = useCan('employee:create')
  const canInvite = useCan('invitation:create')
  const employees = useAllEmployees()
  const departments = useDepartments()
  const users = useUsers(canSeeUsers)
  const thisMonth = format(new Date(), 'yyyy-MM')

  const data = employees.data?.employees
  const stats = useMemo(() => {
    if (!data || !employees.data) return null
    const payroll = data.reduce((s, e) => s + e.salary, 0)
    return {
      headcount: employees.data.total,
      truncated: employees.data.truncated,
      active: data.filter((e) => e.status === 'ACTIVE').length,
      onLeave: data.filter((e) => e.status === 'ON_LEAVE').length,
      payroll,
      avg: data.length ? payroll / data.length : 0,
      joinedThisMonth: data.filter((e) => e.dateOfJoining.startsWith(thisMonth)).length,
      months: hiresByMonth(data),
      bands: salaryBands(data),
    }
  }, [data, employees.data, thisMonth])

  const actions = (
    <>
      {canInvite && (
        <Button asChild>
          <Link to="/team?invite=1" viewTransition>
            <UserPlus /> Invite member
          </Link>
        </Button>
      )}
      {canCreate && (
        <Button asChild variant="primary">
          <Link to="/employees?new=1" viewTransition>
            <Plus /> Add employee
          </Link>
        </Button>
      )}
    </>
  )

  return (
    <>
      <PageHeader title={org.data?.name ?? <Skeleton className="h-8 w-56" />} actions={actions} />
      <PageBody className="md:py-8">
        {employees.isError ? (
          <ErrorState error={employees.error} onRetry={() => employees.refetch()} />
        ) : !stats ? (
          <div className="space-y-5">
            <Skeleton className="h-9 w-full max-w-xl" />
            <Skeleton className="h-9 w-2/3 max-w-md" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : stats.headcount === 0 ? (
          <EmptyState
            icon={<Users />}
            title="Your roster is empty"
            description="Add your first employee to see headcount, hiring and payroll here."
            action={
              canCreate && (
                <Button asChild variant="primary">
                  <Link to="/employees?new=1" viewTransition>
                    <Plus /> Add employee
                  </Link>
                </Button>
              )
            }
          />
        ) : (
          <div className="flex flex-col gap-8">
            <section>
              <Summary
                headcount={stats.headcount}
                departments={departments.data?.length}
                joined={stats.joinedThisMonth}
                onLeave={stats.onLeave}
              />
              <div className="mt-6">
                <RosterWall employees={data!} thisMonth={thisMonth} total={stats.headcount} />
              </div>
              {stats.truncated && (
                <p className="mt-3 text-xs text-muted">
                  Figures below use the first {data!.length.toLocaleString('en-IN')} people.
                </p>
              )}
            </section>

            <dl className="grid grid-cols-2 gap-y-5 border-y border-border py-5 lg:grid-cols-4 lg:divide-x lg:divide-border">
              <Figure label="Active">
                <ActiveShare active={stats.active} total={stats.headcount} />
              </Figure>
              <Figure label="Annual payroll">{formatCurrencyCompact(stats.payroll)}</Figure>
              <Figure label="Average salary">{formatCurrencyCompact(stats.avg)}</Figure>
              {canSeeUsers ? (
                <Figure label="Members who can sign in">
                  {users.data ? <CountUp value={users.data.length} /> : <Skeleton className="h-6 w-8" />}
                </Figure>
              ) : (
                <Figure label="Departments">{departments.data?.length ?? '–'}</Figure>
              )}
            </dl>

            <div className="grid overflow-hidden rounded-lg border border-border bg-surface lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:divide-x lg:divide-border">
              <ChartSection
                title="Hires per month"
                subtitle="By joining date, last 12 months"
                table={<HiresTable months={stats.months} />}
              >
                <HiresChart months={stats.months} />
              </ChartSection>
              <ChartSection
                title="Salary bands"
                subtitle="People per annual salary range"
                table={<BandsTable bands={stats.bands} />}
                className="border-t border-border lg:border-t-0"
              >
                <SalaryBands bands={stats.bands} />
              </ChartSection>
            </div>
          </div>
        )}
      </PageBody>
    </>
  )
}

/* ---------- summary ---------- */

function Summary({
  headcount,
  departments,
  joined,
  onLeave,
}: {
  headcount: number
  departments?: number
  joined: number
  onLeave: number
}) {
  const count = useCountUp(headcount, { fromZero: true })
  const second = [
    joined > 0 ? `${plural(joined, 'person', 'people')} joined this month` : 'Nobody new this month',
    onLeave > 0 ? `${onLeave} on leave` : null,
  ]
    .filter(Boolean)
    .join(', ')
  return (
    <motion.p
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
      className="max-w-[34ch] font-display text-[26px] font-medium leading-[1.2] text-foreground sm:text-[32px]"
    >
      <span className="num font-semibold">{count}</span> {headcount === 1 ? 'person' : 'people'}
      {departments !== undefined && departments > 0 && <> across {plural(departments, 'department')}</>}.{' '}
      <span className="text-muted">{second}.</span>
    </motion.p>
  )
}

function Figure({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="px-0 lg:px-6 lg:first:pl-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 font-display text-[22px] font-semibold leading-tight">{children}</dd>
    </div>
  )
}

function CountUp({ value }: { value: number }) {
  return <span className="num">{useCountUp(value, { fromZero: true })}</span>
}

function ActiveShare({ active, total }: { active: number; total: number }) {
  const pct = total ? Math.round((active / total) * 100) : 0
  return (
    <span className="flex items-center gap-3">
      <span className="num">{useCountUp(pct, { fromZero: true })}%</span>
      <span
        className="h-1.5 w-20 overflow-hidden rounded-full bg-chart-track"
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Share of employees who are active"
      >
        <motion.span
          className="block h-full rounded-full bg-chart-1"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease, delay: 0.2 }}
        />
      </span>
    </span>
  )
}

/* ---------- charts ---------- */

function ChartSection({
  title,
  subtitle,
  table,
  children,
  className,
}: {
  title: string
  subtitle: string
  table: ReactNode
  children: ReactNode
  className?: string
}) {
  const [view, setView] = useState<'chart' | 'table'>('chart')
  return (
    <section className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-[16px] font-semibold">{title}</h2>
          <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
        </div>
        <div className="relative flex rounded-md bg-surface-2 p-0.5 text-xs ring-1 ring-inset ring-border" role="tablist">
          {(['chart', 'table'] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={cn(
                'relative rounded px-2 py-0.5 capitalize transition-colors',
                view === v ? 'text-foreground' : 'text-muted hover:text-foreground',
              )}
            >
              {view === v && (
                <motion.span
                  layoutId={`${title}-view`}
                  className="absolute inset-0 rounded bg-surface shadow-[0_1px_2px_rgb(28_39_51/0.1)]"
                  transition={spring.indicator}
                />
              )}
              <span className="relative">{v}</span>
            </button>
          ))}
        </div>
      </div>
      <motion.div
        key={view}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="mt-4"
      >
        {view === 'chart' ? children : table}
      </motion.div>
    </section>
  )
}

const axisTick = { fill: 'var(--muted)', fontSize: 11 }

function HiresChart({ months }: { months: MonthBucket[] }) {
  return (
    <div className="h-56" role="img" aria-label="Bar chart of hires per month for the last 12 months">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={months} margin={{ top: 8, right: 4, bottom: 0, left: -24 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} interval={0} dy={6} />
          <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} width={48} />
          <Tooltip
            cursor={{ fill: 'var(--surface-2)' }}
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload as MonthBucket | undefined
              if (!active || !p) return null
              return (
                <div className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs shadow-pop">
                  <p className="text-muted">{format(new Date(`${p.key}-01T00:00:00`), 'MMMM yyyy')}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 font-medium">
                    <span className="size-2 rounded-[2px] bg-chart-1" /> {plural(p.hires, 'hire')}
                  </p>
                </div>
              )
            }}
          />
          <Bar dataKey="hires" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={24} animationDuration={700} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function SalaryBands({ bands }: { bands: SalaryBand[] }) {
  const max = Math.max(1, ...bands.map((b) => b.count))
  return (
    <ul className="flex h-56 flex-col justify-center gap-4" aria-label="Employees by salary band">
      {bands.map((b, i) => (
        <li key={b.label} className="grid grid-cols-[104px_minmax(0,1fr)] items-center gap-3 text-xs">
          <span className="truncate text-muted">{b.label}</span>
          <span className="flex items-center gap-2" title={`${b.label}: ${plural(b.count, 'person', 'people')}`}>
            <motion.span
              className="h-3 min-w-[3px] rounded-r-[4px] bg-chart-1"
              initial={{ width: 0 }}
              animate={{ width: `${(b.count / max) * 82}%` }}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.05, ease }}
            />
            <span className="num shrink-0 text-foreground">{b.count}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

function HiresTable({ months }: { months: MonthBucket[] }) {
  return (
    <SimpleTable
      head={['Month', 'Hires']}
      rows={months.map((m) => [format(new Date(`${m.key}-01T00:00:00`), 'MMM yyyy'), m.hires])}
    />
  )
}

function BandsTable({ bands }: { bands: SalaryBand[] }) {
  return <SimpleTable head={['Salary band', 'People']} rows={bands.map((b) => [b.label, b.count])} />
}

function SimpleTable({ head, rows }: { head: [string, string]; rows: Array<[string, number]> }) {
  return (
    <div className="h-56 overflow-y-auto">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-surface">
          <tr className="border-b border-border text-muted">
            <th className="py-1.5 text-left font-medium">{head[0]}</th>
            <th className="py-1.5 text-right font-medium">{head[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-b border-border last:border-0">
              <td className="py-1.5">{k}</td>
              <td className="num py-1.5 text-right">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
