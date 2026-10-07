import { Link } from 'react-router'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/feedback/states'

export function ForbiddenPage() {
  return (
    <div className="grid min-h-[70vh] place-items-center">
      <EmptyState
        icon={<Lock />}
        title="This area is restricted"
        description="Your role doesn’t include access to this page. Ask an owner or admin if you think that’s wrong."
        action={
          <Button asChild>
            <Link to="/">Back to overview</Link>
          </Button>
        }
      />
    </div>
  )
}
