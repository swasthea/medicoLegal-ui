import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from './client'
import { mlcService, mlrService } from './mlcService'

afterEach(() => vi.restoreAllMocks())

describe('MLC / MLR API contract mapping', () => {
  it('lists MLC cases with backend pagination and filters', async () => {
    const page = { content: [{ id: 'mlc-1', status: 'IDENTIFIED' }], totalElements: 1, totalPages: 1, currentPage: 0, pageSize: 20 }
    const get = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: { success: true, data: page } } as never)

    await expect(mlcService.list({ status: 'IDENTIFIED', intakeSource: 'BROUGHT_DEAD', page: 0, size: 20 })).resolves.toEqual(page)
    expect(get).toHaveBeenCalledWith('/api/v1/birth-death/mlc', { params: { status: 'IDENTIFIED', intakeSource: 'BROUGHT_DEAD', page: 0, size: 20 } })
  })

  it('creates an identified case using the verified request shape', async () => {
    const created = { id: 'mlc-1', status: 'IDENTIFIED', legalChecklist: [{ code: 'FIR_FILED', satisfied: false }] }
    const post = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { success: true, data: created } } as never)
    const request = { intakeSource: 'EMERGENCY_WARD', natureOfIncident: 'ASSAULT', incidentSummary: 'Incident summary with enough detail', deceasedUnidentified: false, episodes: [] }

    await expect(mlcService.create(request)).resolves.toEqual(created)
    expect(post).toHaveBeenCalledWith('/api/v1/birth-death/mlc', request)
  })

  it('sends optimistic version and target status for transitions', async () => {
    const result = { id: 'mlc-1', status: 'REGISTERED', version: 2 }
    const post = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { success: true, data: result } } as never)

    await mlcService.transition('mlc-1', 'REGISTERED', 'Police and FIR verified')
    expect(post).toHaveBeenCalledWith('/api/v1/birth-death/mlc/mlc-1/transitions', { targetStatus: 'REGISTERED', reason: 'Police and FIR verified' })
  })

  it('generates MLR with the current MLC version and supports approval actions', async () => {
    const draft = { id: 'mlr-1', mlcCaseId: 'mlc-1', status: 'DRAFT' }
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: { success: true, data: draft } } as never)

    await mlrService.generate('mlc-1', { expectedMlcVersion: 4 })
    await mlrService.submit('mlr-1', { comment: 'Ready for registrar review' })
    await mlrService.approve('mlr-1', { comment: 'Reviewed and approved' })
    await mlrService.issue('mlr-1', { comment: 'Issue report' })

    expect(post).toHaveBeenNthCalledWith(1, '/api/v1/birth-death/mlr/mlc-1/generate', { expectedMlcVersion: 4 })
    expect(post).toHaveBeenNthCalledWith(2, '/api/v1/birth-death/mlr/mlr-1/submit', { comment: 'Ready for registrar review' })
    expect(post).toHaveBeenNthCalledWith(3, '/api/v1/birth-death/mlr/mlr-1/approve', { comment: 'Reviewed and approved' })
    expect(post).toHaveBeenNthCalledWith(4, '/api/v1/birth-death/mlr/mlr-1/issue', { comment: 'Issue report' })
  })

  it('surfaces backend envelope errors', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: { success: false, data: null, error: { code: 'BR-10', message: 'Checklist gates unsatisfied' } } } as never)
    await expect(mlcService.get('mlc-1')).rejects.toThrow('Checklist gates unsatisfied')
  })
})
