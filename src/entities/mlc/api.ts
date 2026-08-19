import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { mlcService, mlrService } from '@shared/api/mlcService'
import type { CreateMlcRequest, MlcCase, MlrActionRequest, MlrDocument, MlrGenerateRequest, UpdateMlcRequest } from '@shared/types'

export const MLC_QUERY_KEYS = {
  all: ['mlc-cases'] as const,
  list: (params?: Record<string, unknown>) => [...MLC_QUERY_KEYS.all, 'list', params ?? {}] as const,
  detail: (id: string) => [...MLC_QUERY_KEYS.all, 'detail', id] as const,
  byDeath: (id: string) => [...MLC_QUERY_KEYS.all, 'by-death', id] as const,
}

export const MLR_QUERY_KEYS = {
  all: ['mlr-documents'] as const,
  list: (params?: Record<string, unknown>) => [...MLR_QUERY_KEYS.all, 'list', params ?? {}] as const,
  detail: (id: string) => [...MLR_QUERY_KEYS.all, 'detail', id] as const,
  byMlc: (id: string) => [...MLR_QUERY_KEYS.all, 'by-mlc', id] as const,
}

export function useMlcList(params?: { status?: string; intakeSource?: string; firNumber?: string; page?: number; size?: number }) {
  return useQuery<{ content: MlcCase[]; totalElements: number; totalPages: number; currentPage: number; pageSize: number }>({ queryKey: MLC_QUERY_KEYS.list(params), queryFn: () => mlcService.list(params ?? {}) })
}

export function useMlc(id: string | undefined) {
  return useQuery<MlcCase>({ queryKey: MLC_QUERY_KEYS.detail(id ?? ''), queryFn: () => mlcService.get(id!), enabled: !!id })
}

export function useMlcByNumber(number: string | undefined) {
  return useQuery<MlcCase>({ queryKey: [...MLC_QUERY_KEYS.all, 'number', number ?? ''], queryFn: () => mlcService.getByNumber(number!), enabled: !!number })
}

export function useMlcByDeathRegistration(id: string | undefined) {
  return useQuery<MlcCase[]>({ queryKey: MLC_QUERY_KEYS.byDeath(id ?? ''), queryFn: () => mlcService.byDeathRegistration(id!), enabled: !!id })
}

function invalidateMlc(qc: ReturnType<typeof useQueryClient>, id?: string) {
  qc.invalidateQueries({ queryKey: MLC_QUERY_KEYS.all })
  if (id) qc.invalidateQueries({ queryKey: MLC_QUERY_KEYS.detail(id) })
}

export function useCreateMlc() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (request: CreateMlcRequest) => mlcService.create(request), onSuccess: () => invalidateMlc(qc) })
}

export function useUpdateMlc() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ id, request }: { id: string; request: UpdateMlcRequest }) => mlcService.update(id, request), onSuccess: (_, variables) => invalidateMlc(qc, variables.id) })
}

export function useTransitionMlc() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ id, targetStatus, reason }: { id: string; targetStatus: string; reason?: string }) => mlcService.transition(id, targetStatus, reason), onSuccess: (_, variables) => invalidateMlc(qc, variables.id) })
}

export function useLinkDeathRegistration() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ id, deathRegistrationId }: { id: string; deathRegistrationId: string }) => mlcService.linkDeathRegistration(id, deathRegistrationId), onSuccess: (_, variables) => invalidateMlc(qc, variables.id) })
}

export function useDiscardMlc() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (id: string) => mlcService.discard(id), onSuccess: () => invalidateMlc(qc) })
}

export function useMlrList(params?: { mlcCaseId?: string; status?: string; page?: number; size?: number }) {
  return useQuery<{ content: MlrDocument[]; totalElements: number; totalPages: number; currentPage: number; pageSize: number }>({ queryKey: MLR_QUERY_KEYS.list(params), queryFn: () => mlrService.list(params ?? {}) })
}

export function useMlrByMlc(id: string | undefined) {
  return useQuery<MlrDocument[]>({ queryKey: MLR_QUERY_KEYS.byMlc(id ?? ''), queryFn: () => mlrService.byMlcCase(id!), enabled: !!id })
}

function invalidateMlr(qc: ReturnType<typeof useQueryClient>, id?: string, mlcCaseId?: string) {
  qc.invalidateQueries({ queryKey: MLR_QUERY_KEYS.all })
  if (id) qc.invalidateQueries({ queryKey: MLR_QUERY_KEYS.detail(id) })
  if (mlcCaseId) qc.invalidateQueries({ queryKey: MLR_QUERY_KEYS.byMlc(mlcCaseId) })
}

export function useGenerateMlr() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ mlcCaseId, request }: { mlcCaseId: string; request: MlrGenerateRequest }) => mlrService.generate(mlcCaseId, request), onSuccess: (document) => { invalidateMlr(qc, document.id, document.mlcCaseId); invalidateMlc(qc, document.mlcCaseId) } })
}

function actionMutation(action: (id: string, request: MlrActionRequest) => Promise<unknown>) {
  return function useMlrAction() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: ({ id, request }: { id: string; request: MlrActionRequest }) => action(id, request),
      onSuccess: () => {
        invalidateMlr(qc)
        // MLR issue/amend/reissue also change MLC state, so invalidate all MLC queries.
        invalidateMlc(qc)
      },
    })
  }
}

export const useSubmitMlr = actionMutation(mlrService.submit)
export const useApproveMlr = actionMutation(mlrService.approve)
export const useIssueMlr = actionMutation(mlrService.issue)
export const useRejectMlr = actionMutation(mlrService.reject)
export const useAmendMlr = actionMutation(mlrService.amend)
export const useReissueMlr = actionMutation(mlrService.reissue)

export type { MlcCase }
