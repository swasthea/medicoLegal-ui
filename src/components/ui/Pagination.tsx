import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'

export function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  if (totalPages <= 1) return null
  return <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
    <Button variant="outline" size="sm" disabled={currentPage <= 0} onClick={() => onPageChange(currentPage - 1)}><ChevronLeft className="h-4 w-4" /> Previous</Button>
    <span className="text-xs text-muted-foreground">Page {currentPage + 1} of {totalPages}</span>
    <Button variant="outline" size="sm" disabled={currentPage >= totalPages - 1} onClick={() => onPageChange(currentPage + 1)}>Next <ChevronRight className="h-4 w-4" /></Button>
  </div>
}
export default Pagination
