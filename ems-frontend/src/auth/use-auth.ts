import { useSyncExternalStore } from 'react'
import { authStore } from './auth-store'
import { can, type Action } from './permissions'

export function useSession() {
  return useSyncExternalStore(authStore.subscribe, authStore.getSnapshot)
}

export function useCan(action: Action) {
  return can(useSession()?.role, action)
}
