import { apiClient } from './client'
import type {
  ApiErrorShape,
  CreateMlcRequest,
  DeathRegistration,
  GenericEnvelope,
  MlcCase,
  MlrActionRequest,
  MlrDocument,
  MlrGenerateRequest,
  PageResult,
  UpdateMlcRequest,
} from '@shared/types'

export const MLC_API_BASE = '/api/v1/birth-death/mlc'
export const MLR_API_BASE = '/api/v1/birth-death/mlr'
export const DEATH_API_BASE = '/api/v1/deaths'

function unwrap<T>(envelope: GenericEnvelope<T>): T {
  if (!envelope.success) throw new Error(envelope.error?.message ?? 'Request failed')
  return envelope.data
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const responseMessage = (error as ApiErrorShape).response?.data?.error?.message
    if (responseMessage) return responseMessage
    if (typeof (error as ApiErrorShape).message === 'string' && (error as ApiErrorShape).message) return (error as ApiErrorShape).message as string
  }
  return fallback
}

export const mlcService = {
  async list(params: { status?: string; intakeSource?: string; firNumber?: string; page?: number; size?: number }): Promise<PageResult<MlcCase>> {
    const response = await apiClient.get<GenericEnvelope<PageResult<MlcCase>>>(MLC_API_BASE, { params })
    return unwrap(response.data)
  },
  async get(id: string): Promise<MlcCase> {
    const response = await apiClient.get<GenericEnvelope<MlcCase>>(`${MLC_API_BASE}/${encodeURIComponent(id)}`)
    return unwrap(response.data)
  },
  async getByNumber(mlcNumber: string): Promise<MlcCase> {
    const response = await apiClient.get<GenericEnvelope<MlcCase>>(`${MLC_API_BASE}/by-mlc-number/${encodeURIComponent(mlcNumber)}`)
    return unwrap(response.data)
  },
  async byDeathRegistration(deathRegistrationId: string): Promise<MlcCase[]> {
    const response = await apiClient.get<GenericEnvelope<MlcCase[]>>(`${MLC_API_BASE}/by-death-registration/${encodeURIComponent(deathRegistrationId)}`)
    return unwrap(response.data)
  },
  async create(request: CreateMlcRequest): Promise<MlcCase> {
    const response = await apiClient.post<GenericEnvelope<MlcCase>>(MLC_API_BASE, request)
    return unwrap(response.data)
  },
  async update(id: string, request: UpdateMlcRequest): Promise<MlcCase> {
    const response = await apiClient.put<GenericEnvelope<MlcCase>>(`${MLC_API_BASE}/${encodeURIComponent(id)}`, request)
    return unwrap(response.data)
  },
  async transition(id: string, targetStatus: string, reason?: string): Promise<MlcCase> {
    const response = await apiClient.post<GenericEnvelope<MlcCase>>(`${MLC_API_BASE}/${encodeURIComponent(id)}/transitions`, { targetStatus, reason })
    return unwrap(response.data)
  },
  async linkDeathRegistration(id: string, deathRegistrationId: string): Promise<MlcCase> {
    const response = await apiClient.post<GenericEnvelope<MlcCase>>(`${MLC_API_BASE}/${encodeURIComponent(id)}/link-death-registration`, undefined, { params: { deathRegistrationId } })
    return unwrap(response.data)
  },
  async discard(id: string): Promise<MlcCase> {
    const response = await apiClient.post<GenericEnvelope<MlcCase>>(`${MLC_API_BASE}/${encodeURIComponent(id)}/discard`)
    return unwrap(response.data)
  },
}

export const mlrService = {
  async list(params: { mlcCaseId?: string; status?: string; page?: number; size?: number }): Promise<PageResult<MlrDocument>> {
    const response = await apiClient.get<GenericEnvelope<PageResult<MlrDocument>>>(MLR_API_BASE, { params })
    return unwrap(response.data)
  },
  async get(id: string): Promise<MlrDocument> {
    const response = await apiClient.get<GenericEnvelope<MlrDocument>>(`${MLR_API_BASE}/${encodeURIComponent(id)}`)
    return unwrap(response.data)
  },
  async byMlcCase(mlcCaseId: string): Promise<MlrDocument[]> {
    const response = await apiClient.get<GenericEnvelope<MlrDocument[]>>(`${MLR_API_BASE}/by-mlc-case/${encodeURIComponent(mlcCaseId)}`)
    return unwrap(response.data)
  },
  async generate(mlcCaseId: string, request: MlrGenerateRequest): Promise<MlrDocument> {
    const response = await apiClient.post<GenericEnvelope<MlrDocument>>(`${MLR_API_BASE}/${encodeURIComponent(mlcCaseId)}/generate`, request)
    return unwrap(response.data)
  },
  async submit(id: string, request: MlrActionRequest): Promise<MlrDocument> {
    const response = await apiClient.post<GenericEnvelope<MlrDocument>>(`${MLR_API_BASE}/${encodeURIComponent(id)}/submit`, request)
    return unwrap(response.data)
  },
  async approve(id: string, request: MlrActionRequest): Promise<MlrDocument> {
    const response = await apiClient.post<GenericEnvelope<MlrDocument>>(`${MLR_API_BASE}/${encodeURIComponent(id)}/approve`, request)
    return unwrap(response.data)
  },
  async issue(id: string, request: MlrActionRequest): Promise<MlrDocument> {
    const response = await apiClient.post<GenericEnvelope<MlrDocument>>(`${MLR_API_BASE}/${encodeURIComponent(id)}/issue`, request)
    return unwrap(response.data)
  },
  async reject(id: string, request: MlrActionRequest): Promise<MlrDocument> {
    const response = await apiClient.post<GenericEnvelope<MlrDocument>>(`${MLR_API_BASE}/${encodeURIComponent(id)}/reject`, request)
    return unwrap(response.data)
  },
  async amend(id: string, request: MlrActionRequest): Promise<MlrDocument> {
    const response = await apiClient.post<GenericEnvelope<MlrDocument>>(`${MLR_API_BASE}/${encodeURIComponent(id)}/amend`, request)
    return unwrap(response.data)
  },
  async reissue(id: string, request: MlrActionRequest): Promise<MlrDocument> {
    const response = await apiClient.post<GenericEnvelope<MlrDocument>>(`${MLR_API_BASE}/${encodeURIComponent(id)}/reissue`, request)
    return unwrap(response.data)
  },
}

export const deathRegistrationService = {
  async list(params: { status?: string; nature?: string; page?: number; size?: number }): Promise<PageResult<DeathRegistration>> {
    const response = await apiClient.get<GenericEnvelope<PageResult<DeathRegistration>>>(DEATH_API_BASE, { params })
    return unwrap(response.data)
  },
  async get(id: string): Promise<DeathRegistration> {
    const response = await apiClient.get<GenericEnvelope<DeathRegistration>>(`${DEATH_API_BASE}/${encodeURIComponent(id)}`)
    return unwrap(response.data)
  },
  async updateMlc(id: string, mlc: Record<string, unknown>): Promise<DeathRegistration> {
    const response = await apiClient.post<GenericEnvelope<DeathRegistration>>(`${DEATH_API_BASE}/${encodeURIComponent(id)}/mlc`, { mlc })
    return unwrap(response.data)
  },
}
