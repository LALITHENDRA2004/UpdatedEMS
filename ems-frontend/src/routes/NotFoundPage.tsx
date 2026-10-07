import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6">
      <div className="text-center">
        <p className="font-mono text-xs text-subtle">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Nothing lives at this address</h1>
        <p className="mt-2 text-[13px] text-muted">The page may have moved, or the link was mistyped.</p>
        <Button asChild variant="primary" className="mt-6">
          <Link to="/">Go to overview</Link>
        </Button>
      </div>
    </div>
  )
}
