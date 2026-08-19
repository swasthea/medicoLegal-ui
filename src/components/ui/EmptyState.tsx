import type { ReactNode } from 'react'

export function EmptyState({ title, description, action, icon }: { title: string; description?: string; action?: ReactNode; icon?: ReactNode }) {
  return <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
    {icon && <div className="text-muted-foreground">{icon}</div>}
    <div><h3 className="font-medium">{title}</h3>{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}</div>
    {action}
  </div>
}
export default EmptyState
