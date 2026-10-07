import type { Variants } from 'framer-motion'

/** Shared easing — a quick ease-out, no bounce. */
export const ease = [0.22, 1, 0.36, 1] as const

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease } },
}

export const stagger = (step = 0.035): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: step } },
})

export const pageTransition = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
  transition: { duration: 0.22, ease },
}
