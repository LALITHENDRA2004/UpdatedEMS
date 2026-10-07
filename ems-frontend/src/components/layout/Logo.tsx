import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-6', className)} aria-hidden>
      <rect width="32" height="32" rx="7" className="fill-accent" />
      <path d="M9 10h14M9 16h10M9 22h14" className="stroke-accent-fg" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight', className)}>
      <LogoMark />
      Roster
    </span>
  )
}
