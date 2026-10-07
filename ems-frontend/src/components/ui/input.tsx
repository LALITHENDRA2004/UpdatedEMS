import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export const inputClass =
  'h-9 w-full min-w-0 rounded-md border border-border-strong bg-surface px-3 text-sm text-foreground ' +
  'shadow-[0_1px_0_rgb(28_39_51/0.03)_inset] placeholder:text-subtle outline-none ' +
  'transition-[border-color,box-shadow,background-color] duration-150 ' +
  'hover:border-subtle/70 focus:border-foreground focus:shadow-[0_0_0_3px_rgb(28_39_51/0.08)] ' +
  'dark:focus:shadow-[0_0_0_3px_rgb(228_233_239/0.1)] focus-visible:outline-none ' +
  'disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted ' +
  'aria-invalid:border-danger aria-invalid:focus:shadow-[0_0_0_3px_rgb(192_53_43/0.12)]'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leading?: ReactNode
  trailing?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, leading, trailing, ...props }, ref) => {
  if (!leading && !trailing) return <input ref={ref} className={cn(inputClass, className)} {...props} />
  return (
    <div className="relative flex items-center">
      {leading && (
        <span className="pointer-events-none absolute left-2.5 flex text-subtle [&_svg]:size-4">{leading}</span>
      )}
      <input
        ref={ref}
        className={cn(inputClass, leading && 'pl-8', trailing && 'pr-9', className)}
        {...props}
      />
      {trailing && <span className="absolute right-1.5 flex">{trailing}</span>}
    </div>
  )
})
Input.displayName = 'Input'
