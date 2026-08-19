import { X } from 'lucide-react'
import type { ReactNode } from 'react'

export function Modal({ open, onClose, title, description, children, footer }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; footer?: ReactNode }) {
  if (!open) return null
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label={title}>
    <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl">
      <div className="flex items-start justify-between border-b border-border px-5 py-4"><div><h2 className="font-semibold">{title}</h2>{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}</div><button type="button" className="rounded p-1 hover:bg-muted" onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></button></div>
      <div className="overflow-y-auto px-5 py-4">{children}</div>
      {footer && <div className="flex justify-end gap-2 border-t border-border px-5 py-4">{footer}</div>}
    </div>
  </div>
}
export default Modal
