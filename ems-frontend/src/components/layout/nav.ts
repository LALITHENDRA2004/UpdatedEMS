import { Building2, LayoutGrid, Settings, UserRoundCog, Users, type LucideIcon } from 'lucide-react'
import type { Action } from '@/auth/permissions'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Hidden unless the role can perform this action. */
  requires?: Action
  end?: boolean
}

export const NAV: NavItem[] = [
  { to: '/', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/departments', label: 'Departments', icon: Building2 },
  { to: '/team', label: 'Members', icon: UserRoundCog, requires: 'user:list' },
  { to: '/settings', label: 'Settings', icon: Settings },
]
