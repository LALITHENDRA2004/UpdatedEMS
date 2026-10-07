import type { PointerEvent, ReactNode } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { Logo } from '@/components/layout/Logo'
import { ease } from '@/components/feedback/motion'
import { UserRound } from 'lucide-react'
import { cn, initials } from '@/lib/utils'

export interface BadgeDetails {
  organization?: string
  name?: string
  role?: string
}

interface AuthLayoutProps {
  title: string
  subtitle: ReactNode
  children: ReactNode
  footer?: ReactNode
  /** Live values for the ID badge on the right (e.g. typed while registering). */
  badge?: BadgeDetails
}

export function AuthLayout({ title, subtitle, children, footer, badge }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh bg-surface lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col px-6 py-6 sm:px-10">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <motion.div
            className="w-full max-w-[360px]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
          >
            <h1 className="font-display text-[32px] font-semibold leading-[1.05]">{title}</h1>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-6 text-[13px] text-muted">{footer}</div>}
          </motion.div>
        </div>
      </div>
      <BadgePanel badge={badge} />
    </div>
  )
}

/** The right-hand panel: a staff ID badge that fills in as you type, tilting gently with the pointer. */
function BadgePanel({ badge }: { badge?: BadgeDetails }) {
  const reduce = useReducedMotion()
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-7, 7]), { stiffness: 140, damping: 18 })
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), { stiffness: 140, damping: 18 })

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }
  const reset = () => {
    px.set(0)
    py.set(0)
  }

  const org = badge?.organization?.trim() || 'Your organization'
  const typedName = badge?.name?.trim()
  const name = typedName || 'Your name'
  const role = badge?.role ?? 'Team member'

  return (
    <div
      className="relative hidden items-center justify-center overflow-hidden border-l border-border bg-background lg:flex"
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ perspective: 900 }}
    >
      <div className="flex flex-col items-center">
        {/* Lanyard */}
        <div aria-hidden className="h-24 w-6 bg-[repeating-linear-gradient(180deg,var(--foreground)_0_6px,#2b3949_6px_12px)] opacity-90 dark:opacity-60" />
        <div aria-hidden className="-mt-px h-5 w-10 rounded-b-md border border-border-strong bg-surface-2" />

        <motion.div
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          initial={{ y: -24, opacity: 0, rotate: -4 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 12, mass: 0.9, delay: 0.15 }}
          className="relative -mt-2 w-[300px] overflow-hidden rounded-[18px] border border-border-strong bg-surface shadow-[0_30px_60px_-20px_rgb(28_39_51/0.35)]"
          aria-label="Preview of your staff ID"
        >
          <div className="mx-auto mt-3 h-2.5 w-14 rounded-full bg-background ring-1 ring-inset ring-border-strong" />
          <div className="mt-3 bg-manila px-5 py-3">
            <p className="truncate font-display text-[17px] font-semibold text-[#3d2f08]">{org}</p>
          </div>
          <div className="flex flex-col items-center px-6 pb-8 pt-6">
            <div className="grid size-24 place-items-center rounded-xl bg-surface-2 font-display text-3xl font-semibold text-muted ring-1 ring-inset ring-border">
              {typedName ? (
                initials(...typedName.split(/[\s._-]+/).slice(0, 2))
              ) : (
                <UserRound aria-hidden className="size-10 text-subtle" strokeWidth={1.25} />
              )}
            </div>
            <p className={cn('mt-4 max-w-full truncate font-display text-[22px] font-semibold', !typedName && 'text-subtle')}>
              {name}
            </p>
            <p className="mt-0.5 text-[13px] text-muted">{role}</p>
          </div>
        </motion.div>
        <p className="mt-10 max-w-[280px] text-center text-[13px] leading-relaxed text-muted">
          Everyone you add to Roster gets a file: their role, pay, contact details and start date.
        </p>
      </div>
    </div>
  )
}

