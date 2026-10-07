import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'
const KEY = 'ems-theme'
const listeners = new Set<() => void>()

const current = (): Theme => (document.documentElement.classList.contains('dark') ? 'dark' : 'light')

export function setTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, current)
  return { theme, toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark') }
}
