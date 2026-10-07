import type { Role } from '@/types/api'

/** Mirrors the @PreAuthorize rules in ems-backend controllers. */
const MATRIX = {
  'employee:create': ['OWNER', 'ADMIN', 'HR'],
  'employee:update': ['OWNER', 'ADMIN', 'HR'],
  'employee:delete': ['OWNER', 'ADMIN'],
  'department:create': ['OWNER', 'ADMIN', 'HR'],
  'department:update': ['OWNER', 'ADMIN', 'HR'],
  'department:delete': ['OWNER', 'ADMIN'],
  'user:list': ['OWNER', 'ADMIN', 'HR'],
  'user:changeRole': ['OWNER', 'ADMIN'],
  'invitation:create': ['OWNER', 'ADMIN'],
  'organization:update': ['OWNER', 'ADMIN'],
  'organization:delete': ['OWNER'],
} as const satisfies Record<string, readonly Role[]>

export type Action = keyof typeof MATRIX

export function can(role: Role | undefined, action: Action): boolean {
  return !!role && (MATRIX[action] as readonly Role[]).includes(role)
}

/**
 * Roles the actor may invite or assign. Business rules from InvitationService / UserService:
 * nobody can grant OWNER, and an ADMIN cannot grant ADMIN.
 */
export function assignableRoles(actor: Role | undefined): Role[] {
  if (actor === 'OWNER') return ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']
  if (actor === 'ADMIN') return ['HR', 'MANAGER', 'EMPLOYEE']
  return []
}

/**
 * Whether `actor` may change `target`'s role (no self-changes, OWNER is immutable).
 * Which roles they may pick is still limited by assignableRoles().
 */
export function canChangeRoleOf(
  actor: { userId: number; role: Role } | null,
  target: { id: number; role: Role },
): boolean {
  if (!actor || !can(actor.role, 'user:changeRole')) return false
  return actor.userId !== target.id && target.role !== 'OWNER'
}
