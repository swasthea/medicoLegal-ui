import { cn } from '@shared/lib'
import * as React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string | null
  hint?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, error, hint, className, id, ...props }, ref) => {
  const inputId = id ?? `input-${label?.replace(/\s+/g, '-').toLowerCase() ?? 'field'}`
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={inputId} className="text-xs font-medium">{label} {props.required && <span className="text-destructive">*</span>}</label>}
      <input ref={ref} id={inputId} className={cn('h-9 rounded-md border border-input bg-card px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50', error && 'border-destructive focus-visible:ring-destructive', className)} {...props} />
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
})
Input.displayName = 'Input'

export default Input
