import { cn } from '@shared/lib'
import * as React from 'react'

export type BadgeVariant = 'success' | 'warning' | 'info' | 'destructive' | 'secondary' | 'default'

const styles: Record<BadgeVariant, string> = {
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning-foreground',
  info: 'bg-info/15 text-info',
  destructive: 'bg-destructive/15 text-destructive',
  secondary: 'bg-secondary text-secondary-foreground',
  default: 'bg-primary/10 text-primary',
}

export function Badge({ className, variant = 'secondary', ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', styles[variant], className)} {...props} />
}
