import type { AlertItem, LegalChecklistItem } from '@shared/types'

// Mirrors the gate codes MLCService.REQUIRED_FOR (backend) checks before each
// transition. Cases created before a gate existed on the backend seed list
// won't have it in legalChecklist yet — this lets an operator add it here
// instead of needing a raw API call.
export const KNOWN_CHECKLIST_GATES: Array<{ code: string; description: string; requiredAtStage?: string }> = [
  { code: 'POLICE_NOTIFIED', description: 'Police station informed', requiredAtStage: 'REGISTERED' },
  { code: 'FIR_FILED', description: 'First Information Report registered', requiredAtStage: 'REGISTERED' },
  { code: 'NEXT_OF_KIN_INFORMED', description: 'Next of kin informed', requiredAtStage: 'REGISTERED' },
  { code: 'POLICE_CASE_NUMBER', description: 'Police case number recorded (brought-dead)', requiredAtStage: 'REGISTERED' },
  { code: 'PM_AUTHORIZED', description: 'Post-mortem authorized', requiredAtStage: 'POST_MORTEM_PENDING' },
  { code: 'PM_COMPLETED', description: 'Post-mortem completed', requiredAtStage: 'POST_MORTEM_COMPLETED' },
  { code: 'INQUEST_OPENED', description: 'Inquest opened', requiredAtStage: 'MLR_DRAFTED' },
  { code: 'BODY_HANDED_OVER', description: 'Body handed over to family/police', requiredAtStage: 'MLR_DRAFTED' },
  { code: 'INQUEST_CLOSED', description: 'Inquest closed', requiredAtStage: 'MLR_ISSUED' },
  { code: 'IDENTIFICATION_CONFIRMED', description: 'Deceased identity confirmed', requiredAtStage: 'MLR_ISSUED' },
  { code: 'IDENTITY_DOCUMENT_RETRIEVED', description: 'Identity document retrieved' },
  { code: 'EVIDENCE_PRESERVED', description: 'Evidence preserved' },
  { code: 'WITNESS_STATEMENT_RECORDED', description: 'Witness statement recorded' },
]

export function formatStatus(status?: string | null): string {
  if (!status) return 'Unknown'
  return status.toLowerCase().split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const response = (error as { response?: { data?: { error?: { message?: string } } }; message?: string }).response
    if (response?.data?.error?.message) return response.data.error.message
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message) return message
  }
  return fallback
}

export function matchesSearch(values: Array<string | number | null | undefined>, query: string): boolean {
  const normalized = query.trim().toLowerCase()
  return !normalized || values.some((value) => String(value ?? '').toLowerCase().includes(normalized))
}

export function checklistProgress(items: LegalChecklistItem[] = []) {
  const satisfied = items.filter((item) => item.satisfied).length
  return { satisfied, total: items.length, complete: items.length > 0 && satisfied === items.length }
}

export function activeAlerts(alerts: AlertItem[] = []) {
  return alerts.filter((alert) => !alert.resolved)
}

export function toOptional(value: string) {
  const trimmed = value.trim()
  return trimmed || undefined
}

export function statusVariant(status?: string | null): 'success' | 'warning' | 'info' | 'destructive' | 'secondary' {
  if (status === 'MLR_ISSUED' || status === 'ISSUED' || status === 'CLOSED') return 'success'
  if (status === 'CANCELLED' || status === 'SUPERSEDED') return 'destructive'
  if (status === 'POST_MORTEM_PENDING' || status === 'REJECTED' || status === 'ESCALATED') return 'warning'
  if (status === 'REGISTERED' || status === 'UNDER_INVESTIGATION' || status === 'POST_MORTEM_COMPLETED' || status === 'PENDING_APPROVAL' || status === 'APPROVED') return 'info'
  return 'secondary'
}

export const PAGE_SIZE = 20
