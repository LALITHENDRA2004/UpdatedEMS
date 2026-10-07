import type { ComponentProps, ReactNode } from 'react'
import { DropdownMenu as DM, Select as S } from 'radix-ui'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { inputClass } from './input'

const popoverClass =
  'z-50 min-w-40 overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-pop ' +
  'data-[state=open]:animate-[pop-in_120ms_ease-out]'

const itemClass =
  'relative flex h-8 cursor-default select-none items-center gap-2 rounded-md px-2 text-[13px] text-foreground outline-none ' +
  'data-highlighted:bg-surface-2 data-disabled:opacity-40 [&_svg]:size-4 [&_svg]:text-muted'

/* ---------- Dropdown menu ---------- */

export const Menu = DM.Root
export const MenuTrigger = DM.Trigger

export function MenuContent({ className, align = 'end', ...props }: ComponentProps<typeof DM.Content>) {
  return (
    <DM.Portal>
      <DM.Content align={align} sideOffset={6} className={cn(popoverClass, className)} {...props} />
    </DM.Portal>
  )
}

export function MenuItem({
  className,
  tone,
  ...props
}: ComponentProps<typeof DM.Item> & { tone?: 'danger' }) {
  return (
    <DM.Item
      className={cn(itemClass, tone === 'danger' && 'text-danger data-highlighted:bg-danger-soft [&_svg]:text-danger', className)}
      {...props}
    />
  )
}

export function MenuLabel({ className, ...props }: ComponentProps<typeof DM.Label>) {
  return <DM.Label className={cn('px-2 pb-1 pt-1.5 text-xs font-medium text-subtle', className)} {...props} />
}

export function MenuSeparator() {
  return <DM.Separator className="-mx-1 my-1 h-px bg-border" />
}

export function MenuRadioGroup(props: ComponentProps<typeof DM.RadioGroup>) {
  return <DM.RadioGroup {...props} />
}

export function MenuRadioItem({ className, children, ...props }: ComponentProps<typeof DM.RadioItem>) {
  return (
    <DM.RadioItem className={cn(itemClass, 'pr-8', className)} {...props}>
      {children}
      <DM.ItemIndicator className="absolute right-2 flex">
        <Check className="!text-accent" />
      </DM.ItemIndicator>
    </DM.RadioItem>
  )
}

/* ---------- Select ---------- */

interface SelectProps<T extends string> {
  value: T | undefined
  onValueChange: (v: T) => void
  options: ReadonlyArray<{ value: T; label: ReactNode; hint?: ReactNode }>
  placeholder?: string
  id?: string
  className?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

export function Select<T extends string>({
  value,
  onValueChange,
  options,
  placeholder = 'Select…',
  className,
  ...rest
}: SelectProps<T>) {
  return (
    <S.Root value={value} onValueChange={(v) => onValueChange(v as T)}>
      <S.Trigger className={cn(inputClass, 'flex items-center justify-between gap-2 text-left', className)} {...rest}>
        <S.Value placeholder={<span className="text-subtle">{placeholder}</span>} />
        <S.Icon>
          <ChevronDown className="size-4 text-subtle" />
        </S.Icon>
      </S.Trigger>
      <S.Portal>
        <S.Content
          position="popper"
          sideOffset={6}
          className={cn(popoverClass, 'w-(--radix-select-trigger-width)')}
        >
          <S.Viewport>
            {options.map((o) => (
              <S.Item key={o.value} value={o.value} className={cn(itemClass, 'h-auto min-h-8 py-1.5 pr-8')}>
                <div className="flex flex-col">
                  <S.ItemText>{o.label}</S.ItemText>
                  {o.hint && <span className="text-xs text-muted">{o.hint}</span>}
                </div>
                <S.ItemIndicator className="absolute right-2 flex">
                  <Check className="!text-accent" />
                </S.ItemIndicator>
              </S.Item>
            ))}
          </S.Viewport>
        </S.Content>
      </S.Portal>
    </S.Root>
  )
}
