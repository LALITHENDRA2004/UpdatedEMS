import { format, parseISO, startOfMonth, subMonths } from 'date-fns'
import type { Employee } from '@/types/api'

export interface MonthBucket {
  key: string
  label: string
  hires: number
}

/** Hires per month for the trailing `months` months (current month included). */
export function hiresByMonth(employees: Employee[], months = 12): MonthBucket[] {
  const start = startOfMonth(subMonths(new Date(), months - 1))
  const buckets = Array.from({ length: months }, (_, i) => {
    const d = subMonths(startOfMonth(new Date()), months - 1 - i)
    return { key: format(d, 'yyyy-MM'), label: format(d, 'MMM'), hires: 0 }
  })
  const index = new Map(buckets.map((b, i) => [b.key, i]))
  for (const e of employees) {
    const d = parseISO(e.dateOfJoining)
    if (d < start) continue
    const i = index.get(format(d, 'yyyy-MM'))
    if (i !== undefined) buckets[i].hires++
  }
  return buckets
}

export interface SalaryBand {
  label: string
  count: number
}

const BANDS: Array<[number, number, string]> = [
  [0, 300_000, 'Under ₹3L'],
  [300_000, 600_000, '₹3L – 6L'],
  [600_000, 1_200_000, '₹6L – 12L'],
  [1_200_000, 2_500_000, '₹12L – 25L'],
  [2_500_000, Number.POSITIVE_INFINITY, '₹25L and above'],
]

export function salaryBands(employees: Employee[]): SalaryBand[] {
  return BANDS.map(([lo, hi, label]) => ({
    label,
    count: employees.filter((e) => e.salary >= lo && e.salary < hi).length,
  }))
}
