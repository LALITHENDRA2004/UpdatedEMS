import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Logo } from '@/components/layout/Logo'
import { Avatar } from '@/components/ui/misc'
import { Badge } from '@/components/ui/badge'
import { ease, fadeUp, stagger } from '@/components/feedback/motion'

interface AuthLayoutProps {
  title: string
  subtitle: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col px-6 py-6 sm:px-10">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <motion.div
            className="w-full max-w-[360px]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease }}
          >
            <h1 className="text-2xl font-semibold tracking-[-0.025em]">{title}</h1>
            <p className="mt-1.5 text-[13px] text-muted">{subtitle}</p>
            <div className="mt-7">{children}</div>
            {footer && <div className="mt-6 text-[13px] text-muted">{footer}</div>}
          </motion.div>
        </div>
        <p className="text-xs text-subtle">© {new Date().getFullYear()} Roster</p>
      </div>
      <Showcase />
    </div>
  )
}

const PEOPLE = [
  { n: 'Aarav Mehta', r: 'Platform Engineer', s: 'Active' },
  { n: 'Ishita Rao', r: 'People Partner', s: 'Active' },
  { n: 'Kabir Sinha', r: 'Product Designer', s: 'On leave' },
  { n: 'Meera Iyer', r: 'Finance Lead', s: 'Active' },
  { n: 'Rohan Das', r: 'Support Specialist', s: 'Active' },
]

/** Right-hand panel: a quiet glimpse of the product instead of a stock illustration. */
function Showcase() {
  return (
    <div className="relative hidden overflow-hidden border-l border-border bg-surface-2 lg:block">
      {/* Fine ledger grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />
      <div className="relative flex h-full flex-col justify-center px-14">
        <p className="max-w-md text-[28px] font-semibold leading-[1.15] tracking-[-0.03em]">
          Everyone in your organization,
          <span className="text-muted"> kept in one quiet, accurate ledger.</span>
        </p>

        <motion.div
          variants={stagger(0.07)}
          initial="hidden"
          animate="show"
          className="mt-10 max-w-md overflow-hidden rounded-xl border border-border bg-surface shadow-pop"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-xs font-medium text-muted">Employees</span>
            <span className="font-mono text-[11px] text-subtle">5 of 128</span>
          </div>
          {PEOPLE.map((p, i) => (
            <motion.div
              key={p.n}
              variants={fadeUp}
              className="flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-0"
            >
              <Avatar name={p.n.split(' ').map((w) => w[0]).join('')} seed={i * 7 + 3} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">{p.n}</p>
                <p className="truncate text-xs text-muted">{p.r}</p>
              </div>
              <Badge tone={p.s === 'Active' ? 'accent' : 'warning'} dot>
                {p.s}
              </Badge>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
