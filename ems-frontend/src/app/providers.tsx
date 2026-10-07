import { useEffect, useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import { Toaster } from 'sonner'
import { authStore } from '@/auth/auth-store'
import { ApiError } from '@/lib/errors'
import { TooltipProvider } from '@/components/ui/misc'
import { useTheme } from './theme'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Don't hammer the API on auth/permission/not-found errors.
        retry: (count, err) => !(err instanceof ApiError && err.status >= 400 && err.status < 500) && count < 2,
      },
    },
  })
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient)
  const { theme } = useTheme()

  // Data is tenant-scoped: never let one session's cache leak into the next.
  useEffect(() => {
    let previous = authStore.getSnapshot()?.token
    return authStore.subscribe(() => {
      const token = authStore.getSnapshot()?.token
      if (token !== previous) queryClient.clear()
      previous = token
    })
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <TooltipProvider>
          {children}
          <Toaster
            theme={theme}
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast: '!rounded-lg !border-border !bg-surface !text-foreground !shadow-pop !text-[13px] !font-sans',
                description: '!text-muted',
              },
            }}
          />
        </TooltipProvider>
      </MotionConfig>
    </QueryClientProvider>
  )
}
