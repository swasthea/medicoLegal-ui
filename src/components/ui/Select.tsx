import { cn } from '@shared/lib'
import * as React from 'react'

export interface SelectOption { label: string; value: string }
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string | null
  options: SelectOption[]
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ label, error, options, className, id, ...props }, ref) => {
  const selectId = id ?? `select-${label?.replace(/\s+/g, '-').toLowerCase() ?? 'field'}`
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={selectId} className="text-xs font-medium">{label} {props.required && <span className="text-destructive">*</span>}</label>}
      <select ref={ref} id={selectId} className={cn('h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50', error && 'border-destructive', className)} {...props}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
})
Select.displayName = 'Select'

export default Select
