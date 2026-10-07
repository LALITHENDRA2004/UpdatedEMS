import { useState } from 'react'
import { useLocation, useOutlet } from 'react-router'
import { Dialog as D } from 'radix-ui'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu as MenuIcon, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { pageTransition } from '@/components/feedback/motion'
import { Sidebar } from './Sidebar'
import { CommandMenu } from './CommandMenu'
import { Logo } from './Logo'

export function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <div className="min-h-dvh bg-background md:grid md:grid-cols-[232px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh md:block">
        <Sidebar onOpenSearch={() => setSearchOpen(true)} />
      </aside>

      {/* Mobile top bar + drawer */}
      <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-border bg-background/90 px-3 backdrop-blur md:hidden">
        <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(true)} aria-label="Open navigation">
          <MenuIcon />
        </Button>
        <Logo />
        <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} aria-label="Search">
          <Search />
        </Button>
      </header>
      <D.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <AnimatePresence>
          {drawerOpen && (
            <D.Portal forceMount>
              <D.Overlay asChild forceMount>
                <motion.div
                  className="fixed inset-0 z-40 bg-[oklch(0.2_0.01_70/0.3)] md:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              </D.Overlay>
              <D.Content asChild forceMount aria-describedby={undefined}>
                <motion.div
                  className="fixed inset-y-0 left-0 z-50 w-[272px] border-r border-border bg-background shadow-pop outline-none md:hidden"
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', stiffness: 420, damping: 40 }}
                >
                  <D.Title className="sr-only">Navigation</D.Title>
                  <Sidebar
                    onNavigate={() => setDrawerOpen(false)}
                    onOpenSearch={() => {
                      setDrawerOpen(false)
                      setSearchOpen(true)
                    }}
                  />
                </motion.div>
              </D.Content>
            </D.Portal>
          )}
        </AnimatePresence>
      </D.Root>

      {/* Content panel: an inset sheet on desktop, flush on mobile */}
      <main className="min-w-0 md:py-2 md:pr-2">
        <div className="min-h-[calc(100dvh-3rem)] bg-surface md:min-h-[calc(100dvh-1rem)] md:rounded-xl md:border md:border-border md:shadow-[0_1px_2px_oklch(0.2_0.01_70/0.04)]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={location.pathname} {...pageTransition}>
              {outlet}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <CommandMenu open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  )
}
