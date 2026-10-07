import { format } from 'date-fns'
import { LogOut, Moon, Sun, type LucideIcon } from 'lucide-react'
import { authStore } from '@/auth/auth-store'
import { useSession } from '@/auth/use-auth'
import { setTheme, useTheme, type Theme } from '@/app/theme'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/misc'
import { initials, cn } from '@/lib/utils'
import { RoleBadge, ROLE_HINT } from '@/features/team/RoleBadge'
import { SettingsLayout, SettingsSection } from './SettingsLayout'

export function ProfilePage() {
  const session = useSession()
  const { theme } = useTheme()
  if (!session) return null

  return (
    <SettingsLayout>
      <SettingsSection title="Your account">
        <div className="flex items-center gap-4">
          <Avatar name={initials(session.email)} seed={session.email} className="size-12 rounded-lg text-base" />
          <div className="min-w-0">
            <p className="truncate font-medium">{session.email}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
              <RoleBadge role={session.role} /> {ROLE_HINT[session.role]}
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Appearance" description="Saved on this device.">
        <div className="grid max-w-md grid-cols-2 gap-2">
          {(
            [
              ['light', 'Light', Sun],
              ['dark', 'Dark', Moon],
            ] as Array<[Theme, string, LucideIcon]>
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-[13px] font-medium transition-colors',
                theme === value
                  ? 'border-manila bg-manila-soft text-manila-ink'
                  : 'border-border-strong text-muted hover:text-foreground',
              )}
              aria-pressed={theme === value}
            >
              <Icon className="size-4" /> {label}
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Session"
        description={`Signed in until ${format(session.expiresAt, "dd MMM yyyy, HH:mm")}. You’ll be asked to sign in again after that.`}
        footer={
          <Button onClick={() => authStore.signOut()}>
            <LogOut /> Sign out
          </Button>
        }
      >
        <p className="num text-xs text-muted">
          User ID {session.userId}, workspace ID {session.organizationId}
        </p>
      </SettingsSection>
    </SettingsLayout>
  )
}
