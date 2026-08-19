export interface GenericEnvelope<T> {
  success: boolean
  data: T
  error?: { code?: string; message?: string; field?: string | null } | null
  meta?: Record<string, unknown>
}

export interface PageResult<T> {
  content: T[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export interface ApiErrorShape {
  response?: {
    data?: GenericEnvelope<unknown>
    status?: number
  }
  message?: string
}

export const MLC_STATUSES = [
  'DRAFT', 'IDENTIFIED', 'REGISTERED', 'UNDER_INVESTIGATION',
  'POST_MORTEM_PENDING', 'POST_MORTEM_COMPLETED', 'MLR_DRAFTED',
  'MLR_ISSUED', 'CLOSED', 'CANCELLED', 'ESCALATED',
] as const
export type MlcStatus = (typeof MLC_STATUSES)[number]

export const MLR_STATUSES = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ISSUED', 'REJECTED', 'SUPERSEDED'] as const
export type MlrStatus = (typeof MLR_STATUSES)[number]

export function formatStatus(status?: string | null): string {
  if (!status) return 'Unknown'
  return status.toLowerCase().split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const typed = error as ApiErrorShape
    const envelopeMessage = typed.response?.data?.error?.message
    if (envelopeMessage) return envelopeMessage
    if (typeof typed.message === 'string' && typed.message) return typed.message
  }
  return fallback
}

export function matchesSearch(values: Array<string | number | null | undefined>, query: string): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return values.some((value) => String(value ?? '').toLowerCase().includes(normalized))
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

export interface PatientEpisode {
  episodeId?: string
  patientId?: string
  patientUhid?: string
  episodeType?: string
  encounterId?: string
  intakeAt?: string
  dischargeAt?: string
  deathAt?: string
  ward?: string
  bed?: string
  treatingDoctorId?: string
  treatingDoctorName?: string
  clinicalSummary?: string
}

export interface LegalChecklistItem {
  code: string
  description?: string
  mandatory?: boolean
  satisfied?: boolean
  satisfiedBy?: string
  satisfiedAt?: string
  evidenceRef?: string
  requiredAtStage?: string
}

export interface AlertItem {
  code: string
  severity?: 'INFO' | 'WARNING' | 'CRITICAL' | string
  message?: string
  resolved?: boolean
  raisedAt?: string
  resolvedAt?: string
  resolvedBy?: string
  sourceRule?: string
}

export interface MlcCase {
  id: string
  organizationId?: string
  partnerId?: string
  mlcNumber?: string
  status: MlcStatus | string
  intakeSource?: string
  natureOfIncident?: string
  incidentSummary?: string
  incidentDateTime?: string
  incidentLocation?: string
  policeStation?: string
  firNumber?: string
  investigatingOfficer?: string
  inquestReportNumber?: string
  deceasedUnidentified?: boolean
  deathRegistrationId?: string
  episodes?: PatientEpisode[]
  legalChecklist?: LegalChecklistItem[]
  alerts?: AlertItem[]
  version?: number
  createdBy?: string
  createdAt?: string
  updatedBy?: string
  updatedAt?: string
}

export interface CreateMlcRequest {
  intakeSource: string
  natureOfIncident: string
  incidentSummary: string
  incidentDateTime?: string
  incidentLocation?: string
  deceasedUnidentified: boolean
  episodes?: PatientEpisode[]
  version?: number
}

export interface UpdateMlcRequest {
  version?: number
  incidentSummary?: string
  incidentLocation?: string
  incidentDateTime?: string
  policeStation?: string
  firNumber?: string
  investigatingOfficer?: string
  inquestReportNumber?: string
  episodes?: PatientEpisode[]
  legalChecklist?: LegalChecklistItem[]
  alerts?: AlertItem[]
  deathRegistrationId?: string
}

export interface MlrDocument {
  id: string
  organizationId?: string
  partnerId?: string
  mlcCaseId: string
  mlrNumber?: string
  status: MlrStatus | string
  body?: string
  preparedBy?: string
  preparedAt?: string
  approvedBy?: string
  approvedAt?: string
  issuedBy?: string
  issuedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string
  supersededByMlrId?: string
  checklistSnapshot?: LegalChecklistItem[]
  version?: number
}

export interface MlrActionRequest { comment: string }
export interface MlrGenerateRequest { expectedMlcVersion: number }

export interface HospitalDoctor {
  facilityCode?: string
  department?: string
  ward?: string
  bedNumber?: string
  doctorId?: string
  doctorName?: string
  doctorRegistrationNo?: string
  doctorDesignation?: string
}

export interface DeathMlcDetails {
  mlcNumber?: string
  policeStation?: string
  firNumber?: string
  investigatingOfficer?: string
  inquestReportNumber?: string
  postMortem?: {
    required?: boolean
    completed?: boolean
    pmDoctorId?: string
    pmDoctorName?: string
    pmDateTime?: string
    pmFindingsSummary?: string
    visceraPreserved?: boolean
    waivedBy?: string
    waiverReason?: string
  }
  bodyHandedOverTo?: string
  bodyHandedOverIdProof?: string
}

export interface DeceasedDetails {
  uhid?: string
  abhaId?: string
  fullName?: string
  age?: number
  sex?: string
  aadhaarLast4?: string
  identificationStatus?: string
}

export interface CauseOfDeath {
  partI?: { immediate?: string; antecedent?: string; underlying?: string }
  partII?: string[]
  icdCodes?: string[]
  approximateInterval?: string
}

export interface CreateDeathRegistrationRequest {
  version?: number
  facilityCode: string
  natureOfDeath: 'NATURAL' | 'UNNATURAL'
  deceased: DeceasedDetails
  dateTimeOfDeath: string
  placeOfDeath: string
  intakeSource?: 'ADMITTED' | 'BROUGHT_DEAD' | 'IN_TRANSIT' | string
  hospital: HospitalDoctor
  certifyingDoctor?: HospitalDoctor
  causeOfDeath?: CauseOfDeath
  mlc?: DeathMlcDetails
}

export interface DeathRegistration {
  id: string
  registrationNumber?: string
  facilityCode?: string
  status?: string
  natureOfDeath?: string
  deceased?: DeceasedDetails
  dateTimeOfDeath?: string
  placeOfDeath?: string
  intakeSource?: string
  mlc?: DeathMlcDetails
  version?: number
}
