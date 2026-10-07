import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6">
      <div className="text-center">
        <h1 className="font-display text-[32px] font-semibold">There’s no page here</h1>
        <p className="mt-2 text-[13px] text-muted">Check the address, or go back to the overview.</p>
        <Button asChild variant="primary" className="mt-6">
          <Link to="/">Go to overview</Link>
        </Button>
      </div>
    </div>
  )
}
