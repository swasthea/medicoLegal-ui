import axios, { AxiosError } from 'axios'
import { config } from '@shared/config'
import { useAuthStore } from '@shared/store/authStore'

export const apiClient = axios.create({
  baseURL: config.apiBaseUrl || undefined,
  headers: { 'Content-Type': 'application/json' },
})

declare global {
  interface Window {
    __swasthea_ensure_token?: () => Promise<string | null> | string | null
    __swasthea_get_token?: () => string | null
  }
}

async function resolveAccessToken(): Promise<string | null> {
  try {
    const bridge = typeof window !== 'undefined' ? window.__swasthea_ensure_token : undefined
    if (typeof bridge === 'function') {
      const token = await bridge()
      if (token) return token
    }
  } catch {
    // The standalone fallback below remains available when the shell bridge is absent.
  }

  try {
    const getter = typeof window !== 'undefined' ? window.__swasthea_get_token : undefined
    if (typeof getter === 'function') {
      const token = getter()
      if (token) return token
    }
  } catch {
    // fall through
  }

  const state = useAuthStore.getState()
  if (state.accessToken) return state.accessToken
  if (state.token) return state.token

  try {
    const raw = window.localStorage.getItem('arogyaplus-auth')
    if (!raw) return null
    const parsed = JSON.parse(raw) as { state?: { accessToken?: string | null; token?: string | null } }
    return parsed.state?.accessToken ?? parsed.state?.token ?? null
  } catch {
    return null
  }
}

apiClient.interceptors.request.use(async (request) => {
  const token = await resolveAccessToken()
  if (token && request.headers) request.headers.Authorization = `Bearer ${token}`
  const { organizationId, partnerId } = useAuthStore.getState()
  if (organizationId && request.headers) request.headers['X-Organization-Id'] = organizationId
  if (partnerId && request.headers) request.headers['X-Partner-Id'] = partnerId
  return request
})

apiClient.interceptors.response.use((response) => response, (error: AxiosError) => {
  if (error.response?.status === 401) {
    useAuthStore.getState().clearAuth()
    if (typeof window !== 'undefined' && !window.location.pathname.endsWith('/login')) {
      // Standalone mode has no /login route — redirect to module root.
      window.location.href = '/medico-legal'
    }
  }
  return Promise.reject(error)
})

export function forgetResolvedBackend(): void {
  // Kept for host compatibility; the gateway proxy resolves dynamically in development.
}

export async function resolveBackendBaseUrl(): Promise<string> {
  return config.apiBaseUrl
}
