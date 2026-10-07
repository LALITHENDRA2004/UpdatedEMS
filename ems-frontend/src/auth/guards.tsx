import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession } from './use-auth'
import { can, type Action } from './permissions'
import { ForbiddenPage } from '@/routes/ForbiddenPage'

/** Gate for the authenticated app. Remembers where the user was headed. */
export function RequireAuth() {
  const session = useSession()
  const location = useLocation()
  if (!session) {
    const next = location.pathname + location.search
    return <Navigate to={next === '/' ? '/login' : `/login?next=${encodeURIComponent(next)}`} replace />
  }
  return <Outlet />
}

/**
 * Public-only routes (login/register) bounce signed-in users into the app —
 * back to `?next=` when it's a safe in-app path. Signing in just updates the session; this does the redirect.
 */
export function RedirectIfAuthed() {
  const session = useSession()
  const location = useLocation()
  if (!session) return <Outlet />
  const next = new URLSearchParams(location.search).get('next')
  const safe = next && next.startsWith('/') && !next.startsWith('//') ? next : '/'
  return <Navigate to={safe} replace />
}

export function RequirePermission({ action, children }: { action: Action; children: ReactNode }) {
  const session = useSession()
  return can(session?.role, action) ? children : <ForbiddenPage />
}
