import { cn } from '@shared/lib'
import * as React from 'react'

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <div className="w-full overflow-x-auto rounded-md border border-border"><table className={cn('w-full caption-bottom text-sm', className)} {...props} /></div>
}
export function THead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) { return <thead className={cn('bg-muted/40 [&_tr]:border-b', className)} {...props} /> }
export function TBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) { return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} /> }
export function TR({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) { return <tr className={cn('border-b transition-colors hover:bg-muted/30', className)} {...props} /> }
export function TH({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) { return <th className={cn('px-3 py-2 text-left text-xs font-medium uppercase text-muted-foreground', className)} {...props} /> }
export function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) { return <td className={cn('px-3 py-2 align-middle text-sm', className)} {...props} /> }
