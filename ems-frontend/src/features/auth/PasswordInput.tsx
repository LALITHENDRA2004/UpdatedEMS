import { forwardRef, useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'

export const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>((props, ref) => {
  const [visible, setVisible] = useState(false)
  return (
    <Input
      ref={ref}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="rounded p-1 text-subtle hover:text-foreground"
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
      {...props}
    />
  )
})
PasswordInput.displayName = 'PasswordInput'
