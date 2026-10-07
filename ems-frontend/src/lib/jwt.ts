import { jwtDecode } from 'jwt-decode'
import { ROLES, type Role } from '@/types/api'

interface RawClaims {
  sub: string
  userId: number
  organizationId: number
  role: string
  iat: number
  exp: number
}

export interface Session {
  token: string
  email: string
  userId: number
  organizationId: number
  role: Role
  /** epoch ms */
  expiresAt: number
}

/** Returns null for malformed, unknown-role or already-expired tokens. */
export function decodeSession(token: string): Session | null {
  try {
    const c = jwtDecode<RawClaims>(token)
    if (!ROLES.includes(c.role as Role)) return null
    const expiresAt = c.exp * 1000
    if (expiresAt <= Date.now()) return null
    return {
      token,
      email: c.sub,
      userId: c.userId,
      organizationId: c.organizationId,
      role: c.role as Role,
      expiresAt,
    }
  } catch {
    return null
  }
}
