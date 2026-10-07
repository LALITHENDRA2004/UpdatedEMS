import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion, useReducedMotion } from 'framer-motion'
import { Avatar, Tooltip } from '@/components/ui/misc'
import { initials } from '@/lib/utils'
import type { Employee } from '@/types/api'

const SEEN_KEY = 'roster-wall-assembled'
const MAX_TILES = 56

/**
 * Every person as an ID-photo tile. New joiners this month carry a manila corner.
 * The wall assembles once per session — the dashboard's single orchestrated moment.
 */
export function RosterWall({ employees, thisMonth, total }: { employees: Employee[]; thisMonth: string; total?: number }) {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const [assemble] = useState(() => {
    try {
      const seen = sessionStorage.getItem(SEEN_KEY)
      sessionStorage.setItem(SEEN_KEY, '1')
      return !seen
    } catch {
      return false
    }
  })
  const animateIn = assemble && !reduce

  // Newest first, so this month's joiners lead the wall.
  const sorted = [...employees].sort((a, b) => b.dateOfJoining.localeCompare(a.dateOfJoining))
  const shown = sorted.slice(0, MAX_TILES)
  const hidden = (total ?? sorted.length) - shown.length

  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Everyone on the roster">
      {shown.map((e, i) => {
        const isNew = e.dateOfJoining.startsWith(thisMonth)
        return (
          <motion.li
            key={e.id}
            initial={animateIn ? { opacity: 0, scale: 0.6, y: 6 } : false}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26, delay: animateIn ? 0.15 + i * 0.018 : 0 }}
          >
            <Tooltip
              content={
                <span>
                  {e.firstName} {e.lastName}
                  <span className="opacity-60">, {e.jobTitle}</span>
                  {isNew && <span className="opacity-60"> (joined this month)</span>}
                </span>
              }
            >
              <button
                onClick={() => navigate(`/employees/${e.id}`, { viewTransition: true })}
                className="relative block rounded-md transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[0_4px_10px_-4px_rgb(28_39_51/0.3)]"
                aria-label={`${e.firstName} ${e.lastName}`}
              >
                <Avatar
                  name={initials(e.firstName, e.lastName)}
                  seed={e.id}
                  className="size-10 text-xs"
                  viewTransitionName={`emp-${e.id}`}
                />
                {isNew && (
                  <span
                    aria-hidden
                    className="absolute right-0 top-0 size-0 rounded-tr-md border-l-[10px] border-t-[10px] border-l-transparent border-t-manila"
                  />
                )}
              </button>
            </Tooltip>
          </motion.li>
        )
      })}
      {hidden > 0 && (
        <li>
          <Link
            to="/employees"
            viewTransition
            className="grid size-10 place-items-center rounded-md border border-dashed border-border-strong text-xs font-medium text-muted hover:text-foreground"
          >
            +{hidden}
          </Link>
        </li>
      )}
    </ul>
  )
}
