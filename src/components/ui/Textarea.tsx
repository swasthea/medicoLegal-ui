import { cn } from '@shared/lib'
import * as React from 'react'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string | null
  hint?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, hint, className, id, rows = 3, ...props }, ref) => {
  const textareaId = id ?? `textarea-${label?.replace(/\s+/g, '-').toLowerCase() ?? 'field'}`
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={textareaId} className="text-xs font-medium">{label} {props.required && <span className="text-destructive">*</span>}</label>}
      <textarea ref={ref} id={textareaId} rows={rows} className={cn('rounded-md border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50', error && 'border-destructive', className)} {...props} />
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
})
Textarea.displayName = 'Textarea'

export default Textarea
