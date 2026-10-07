import { Skeleton } from '@/components/ui/misc'

/** Row-shaped placeholder that matches DataTable's rhythm, so nothing jumps when data lands. */
export function TableSkeleton({ rows = 8, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div aria-busy aria-label="Loading">
      <div className="flex h-9 items-center gap-6 border-b border-border px-4 md:px-8">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-2.5 w-16" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex h-12 items-center gap-6 border-b border-border px-4 md:px-8">
          <div className="flex w-56 items-center gap-3">
            <Skeleton className="size-7" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-2.5 w-28" style={{ opacity: 1 - r * 0.08 }} />
              <Skeleton className="h-2 w-20" style={{ opacity: 0.7 - r * 0.06 }} />
            </div>
          </div>
          {Array.from({ length: cols - 1 }).map((_, c) => (
            <Skeleton key={c} className="hidden h-2.5 w-20 md:block" style={{ opacity: 1 - r * 0.08 }} />
          ))}
        </div>
      ))}
    </div>
  )
}
