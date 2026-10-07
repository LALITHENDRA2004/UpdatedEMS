import { toast } from 'sonner'
import { decodeSession, type Session } from '@/lib/jwt'

const STORAGE_KEY = 'ems-token'

type Listener = () => void
type SignOutReason = 'manual' | 'expired'

/**
 * Tiny external store for the JWT session (read with useSyncExternalStore).
 * The backend has no refresh token or /me endpoint, so the decoded JWT *is* the session,
 * and we sign out on our own when `exp` passes.
 */
function createAuthStore() {
  let session: Session | null = null
  let expiryTimer: ReturnType<typeof setTimeout> | undefined
  const listeners = new Set<Listener>()

  const emit = () => listeners.forEach((l) => l())

  const schedule = () => {
    clearTimeout(expiryTimer)
    if (!session) return
    // setTimeout overflows above ~24.8 days; tokens here live 24h, but stay safe.
    const ms = Math.min(session.expiresAt - Date.now(), 2 ** 31 - 1)
    expiryTimer = setTimeout(() => store.signOut('expired'), ms)
  }

  const store = {
    init() {
      try {
        const token = localStorage.getItem(STORAGE_KEY)
        session = token ? decodeSession(token) : null
        if (!session) localStorage.removeItem(STORAGE_KEY)
      } catch {
        session = null
      }
      schedule()
    },
    subscribe(listener: Listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    getSnapshot: () => session,
    signIn(token: string) {
      const next = decodeSession(token)
      if (!next) throw new Error('Received an invalid session token.')
      session = next
      try {
        localStorage.setItem(STORAGE_KEY, token)
      } catch {
        /* storage unavailable — session lives for this tab only */
      }
      schedule()
      emit()
      return next
    },
    signOut(reason: SignOutReason = 'manual') {
      if (!session) return
      session = null
      clearTimeout(expiryTimer)
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        /* ignore */
      }
      if (reason === 'expired') toast.warning('Your session expired. Please sign in again.')
      emit()
    },
  }

  return store
}

export const authStore = createAuthStore()
authStore.init()

// Keep tabs in sync: signing out in one tab signs out everywhere.
window.addEventListener('storage', (e) => {
  if (e.key !== STORAGE_KEY) return
  if (e.newValue) authStore.signIn(e.newValue)
  else authStore.signOut()
})
