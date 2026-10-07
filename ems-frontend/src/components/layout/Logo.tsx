import { cn } from '@/lib/utils'

/** A personnel folder with its manila tab — the product's one recurring motif. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-6', className)} aria-hidden>
      <path d="M3 9a3 3 0 0 1 3-3h7.5l3 3H26a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z" className="fill-foreground" />
      <path d="M3 13.2h26" className="stroke-manila" strokeWidth="2.4" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-display text-[17px] font-semibold', className)}>
      <LogoMark />
      Roster
    </span>
  )
}
