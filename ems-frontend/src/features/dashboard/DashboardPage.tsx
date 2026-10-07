import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowUpRight, Plus, UserPlus } from 'lucide-react'
import { useCan, useSession } from '@/auth/use-auth'
import { Button } from '@/components/ui/button'
import { Avatar, Card, Skeleton } from '@/components/ui/misc'
import { PageBody, PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/feedback/states'
import { fadeUp, stagger } from '@/components/feedback/motion'
import { useEmployees } from '@/features/employees/api'
import { useDepartments } from '@/features/departments/api'
import { useUsers } from '@/features/team/api'
import { useMyOrganization } from '@/features/settings/api'
import { formatCurrency, formatCurrencyCompact, formatDate } from '@/lib/format'
import { cn, initials } from '@/lib/utils'
import { hiresByMonth, recentHires, salaryBands, type MonthBucket, type SalaryBand } from './metrics'

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export function DashboardPage() {
  const session = useSession()
  const org = useMyOrganization()
  const canSeeUsers = useCan('user:list')
  const canCreate = useCan('employee:create')
  const canInvite = useCan('invitation:create')
  const employees = useEmployees()
  const departments = useDepartments()
  const users = useUsers(canSeeUsers)

  const data = employees.data
  const stats = useMemo(() => {
    if (!data) return null
    const payroll = data.reduce((s, e) => s + e.salary, 0)
    const active = data.filter((e) => e.status === 'ACTIVE').length
    const thisMonth = format(new Date(), 'yyyy-MM')
    return {
      headcount: data.length,
      active,
      payroll,
      avg: data.length ? payroll / data.length : 0,
      joinedThisMonth: data.filter((e) => e.dateOfJoining.startsWith(thisMonth)).length,
      months: hiresByMonth(data),
      bands: salaryBands(data),
      recent: recentHires(data),
    }
  }, [data])

  return (
    <>
      <PageHeader
        eyebrow={format(new Date(), 'EEEE, d MMMM')}
        title={`${greeting()}${session ? `, ${session.email.split('@')[0]}` : ''}`}
        description={org.data ? `Here’s how ${org.data.name} looks today.` : ' '}
        actions={
          <>
            {canInvite && (
              <Button asChild>
                <Link to="/team?invite=1">
                  <UserPlus /> Invite
                </Link>
              </Button>
            )}
            {canCreate && (
              <Button asChild variant="primary">
                <Link to="/employees?new=1">
                  <Plus /> New employee
                </Link>
              </Button>
            )}
          </>
        }
      />
      <PageBody>
        {employees.isError ? (
          <ErrorState error={employees.error} onRetry={() => employees.refetch()} />
        ) : (
          <motion.div variants={stagger(0.05)} initial="hidden" animate="show" className="flex flex-col gap-4">
            {/* KPI strip — one bordered strip with hairline dividers, not four floating cards */}
            <motion.div variants={fadeUp}>
              <Card className="grid grid-cols-2 gap-px overflow-hidden bg-border lg:grid-cols-4">
                <Stat label="Headcount" value={stats?.headcount} sub={stats && `${stats.joinedThisMonth} joined this month`} />
                <Stat
                  label="Active"
                  value={stats?.active}
                  sub={stats && <Meter value={stats.active} max={stats.headcount} />}
                />
                <Stat label="Departments" value={departments.data?.length} sub="Across the organization" />
                {canSeeUsers ? (
                  <Stat label="Workspace members" value={users.data?.length} sub="People who can sign in" />
                ) : (
                  <Stat label="Average salary" value={stats && formatCurrencyCompact(stats.avg)} sub="Per year" />
                )}
              </Card>
            </motion.div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
              <motion.div variants={fadeUp}>
                <ChartCard
                  title="Hires per month"
                  subtitle="Employees by joining date, last 12 months"
                  table={stats && <HiresTable months={stats.months} />}
                >
                  {stats ? <HiresChart months={stats.months} /> : <Skeleton className="h-56" />}
                </ChartCard>
              </motion.div>
              <motion.div variants={fadeUp}>
                <ChartCard
                  title="Annual payroll"
                  subtitle={stats ? `${formatCurrency(stats.payroll)} total` : ' '}
                  table={stats && <BandsTable bands={stats.bands} />}
                >
                  {stats ? <SalaryBands bands={stats.bands} /> : <Skeleton className="h-56" />}
                </ChartCard>
              </motion.div>
            </div>

            <motion.div variants={fadeUp}>
              <Card>
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <h2 className="text-[13px] font-semibold">Recent hires</h2>
                  <Link to="/employees" className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground">
                    All employees <ArrowUpRight className="size-3" />
                  </Link>
                </div>
                {!stats ? (
                  <div className="space-y-3 p-5">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-8" />
                    ))}
                  </div>
                ) : stats.recent.length === 0 ? (
                  <p className="px-5 py-8 text-center text-[13px] text-muted">No one has been added yet.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {stats.recent.map((e) => (
                      <li key={e.id}>
                        <Link
                          to={`/employees/${e.id}`}
                          className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-surface-2/60"
                        >
                          <Avatar name={initials(e.firstName, e.lastName)} seed={e.id} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium">
                              {e.firstName} {e.lastName}
                            </p>
                            <p className="truncate text-xs text-muted">{e.jobTitle}</p>
                          </div>
                          <span className="num shrink-0 text-xs text-muted">{formatDate(e.dateOfJoining)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </motion.div>
          </motion.div>
        )}
      </PageBody>
    </>
  )
}

/* ---------- pieces ---------- */

function Stat({ label, value, sub }: { label: string; value: ReactNode | undefined; sub?: ReactNode }) {
  return (
    <div className="bg-surface px-5 py-4">
      <p className="text-xs font-medium text-muted">{label}</p>
      {value === undefined || value === null ? (
        <Skeleton className="mt-2 h-7 w-16" />
      ) : (
        <p className="mt-1 text-[26px] font-semibold leading-tight tracking-[-0.02em]">{value}</p>
      )}
      <div className="mt-1 min-h-4 text-xs text-muted">{sub}</div>
    </div>
  )
}

function Meter({ value, max }: { value: number; max: number }) {
  const pct = max ? Math.round((value / max) * 100) : 0
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-chart-track" role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Active share">
        <motion.span
          className="block h-full rounded-full bg-chart-1"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </span>
      <span className="num">{pct}%</span>
    </span>
  )
}

function ChartCard({
  title,
  subtitle,
  table,
  children,
}: {
  title: string
  subtitle: ReactNode
  table: ReactNode
  children: ReactNode
}) {
  const [view, setView] = useState<'chart' | 'table'>('chart')
  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-3 px-5 pt-4">
        <div>
          <h2 className="text-[13px] font-semibold">{title}</h2>
          <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
        </div>
        <div className="flex rounded-md bg-surface-2 p-0.5 text-xs ring-1 ring-inset ring-border" role="tablist">
          {(['chart', 'table'] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={cn(
                'rounded px-2 py-0.5 capitalize transition-colors',
                view === v ? 'bg-surface text-foreground shadow-[0_1px_1px_oklch(0.2_0.01_70/0.06)]' : 'text-muted hover:text-foreground',
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 pb-4 pt-4">{view === 'chart' ? children : table}</div>
    </Card>
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
                    <span className="size-2 rounded-[2px] bg-chart-1" /> {p.hires} {p.hires === 1 ? 'hire' : 'hires'}
                  </p>
                </div>
              )
            }}
          />
          <Bar dataKey="hires" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={24} animationDuration={600} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function SalaryBands({ bands }: { bands: SalaryBand[] }) {
  const max = Math.max(1, ...bands.map((b) => b.count))
  return (
    <ul className="flex h-56 flex-col justify-center gap-3.5" aria-label="Employees by salary band">
      {bands.map((b, i) => (
        <li key={b.label} className="group grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3 text-xs">
          <span className="truncate text-muted">{b.label}</span>
          <span className="flex items-center gap-2">
            <motion.span
              className="h-3 min-w-[3px] rounded-r-[4px] bg-chart-1 transition-opacity group-hover:opacity-80"
              initial={{ width: 0 }}
              animate={{ width: `${(b.count / max) * 85}%` }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              title={`${b.label}: ${b.count}`}
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
  return <SimpleTable head={['Salary band', 'Employees']} rows={bands.map((b) => [b.label, b.count])} />
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
