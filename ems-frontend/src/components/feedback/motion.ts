import { useEffect, useRef, useState } from 'react'
import { animate, useReducedMotion, type Transition, type Variants } from 'framer-motion'

/** Quick ease-out, no bounce. */
export const ease = [0.22, 1, 0.36, 1] as const

/** Springs tuned per surface: menus snap, dialogs settle, sheets carry a little weight. */
export const spring = {
  snappy: { type: 'spring', stiffness: 520, damping: 38, mass: 0.7 },
  dialog: { type: 'spring', stiffness: 420, damping: 34 },
  sheet: { type: 'spring', stiffness: 340, damping: 36, mass: 0.9 },
  indicator: { type: 'spring', stiffness: 480, damping: 40 },
} satisfies Record<string, Transition>

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease } },
}

export const stagger = (step = 0.035): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: step } },
})

/**
 * Animates a number toward `value` whenever it changes (not on every render).
 * The first value renders immediately unless `fromZero` is set.
 */
export function useCountUp(value: number | undefined, { fromZero = false, duration = 0.7 } = {}) {
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState<number | undefined>(fromZero && value !== undefined ? 0 : value)
  const previous = useRef<number | undefined>(fromZero ? 0 : value)

  useEffect(() => {
    if (value === undefined) return
    const from = previous.current ?? value
    previous.current = value
    if (reduce || from === value) {
      setDisplay(value)
      return
    }
    const controls = animate(from, value, {
      duration,
      ease,
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [value, reduce, duration])

  return display
}

/** Runs `navigate`-style callbacks inside a View Transition when the browser supports it. */
export const canViewTransition = () =>
  typeof document !== 'undefined' &&
  'startViewTransition' in document &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches
