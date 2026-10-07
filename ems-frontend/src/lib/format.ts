import { format, formatDistanceToNowStrict, parseISO } from 'date-fns'
import type { EmployeeStatus, Role } from '@/types/api'

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const inrCompact = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export const formatCurrency = (n: number) => inr.format(n)
export const formatCurrencyCompact = (n: number) => inrCompact.format(n)

/** Backend sends LocalDate / LocalDateTime without zone; parseISO treats them as local time. */
export const formatDate = (iso: string | null | undefined) => (iso ? format(parseISO(iso), 'dd MMM yyyy') : '—')
export const formatRelative = (iso: string) => `${formatDistanceToNowStrict(parseISO(iso))} ago`
export const toIsoDate = (d: Date) => format(d, 'yyyy-MM-dd')

export const ROLE_LABEL: Record<Role, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  HR: 'HR',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
}

export const STATUS_LABEL: Record<EmployeeStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  ON_LEAVE: 'On leave',
  TERMINATED: 'Terminated',
}
