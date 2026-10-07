import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export const inputClass =
  'h-9 w-full min-w-0 rounded-md border border-border-strong bg-surface px-3 text-sm text-foreground ' +
  'placeholder:text-subtle transition-[border-color,box-shadow] duration-150 outline-none ' +
  'hover:border-subtle/60 focus:border-accent focus:ring-[3px] focus:ring-ring ' +
  'disabled:cursor-not-allowed disabled:opacity-60 ' +
  'aria-invalid:border-danger aria-invalid:focus:ring-danger/20'

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
