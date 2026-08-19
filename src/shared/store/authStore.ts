import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: string
  username: string
  email: string
  fullName: string
  role: string
  isActive?: boolean
}

interface AuthStore {
  user: AuthUser | null
  token: string | null
  accessToken: string | null
  isAuthenticated: boolean
  organizationId: string | null
  partnerId: string | null
  setAuth: (user: Partial<AuthUser> & { id: string; email: string; role: string }, token: string, tenant?: { organizationId?: string | null; partnerId?: string | null }) => void
  clearAuth: () => void
  hasRole: (roles: string[]) => boolean
}

export const useAuthStore = create<AuthStore>()(persist((set, get) => ({
  user: null,
  token: null,
  accessToken: null,
  isAuthenticated: false,
  organizationId: null,
  partnerId: null,
  setAuth: (user, token, tenant) => set({
    user: {
      id: user.id,
      username: user.username ?? user.email,
      email: user.email,
      fullName: user.fullName ?? user.username ?? user.email,
      role: user.role,
      isActive: user.isActive,
    },
    token,
    accessToken: token,
    isAuthenticated: true,
    organizationId: tenant?.organizationId ?? null,
    partnerId: tenant?.partnerId ?? null,
  }),
  clearAuth: () => set({ user: null, token: null, accessToken: null, isAuthenticated: false }),
  hasRole: (roles) => {
    const role = get().user?.role?.toLowerCase()
    return role === 'admin' || (!!role && roles.some((candidate) => candidate.toLowerCase() === role))
  },
}), {
  name: 'arogyaplus-auth',
  partialize: (state) => ({
    user: state.user,
    token: state.token,
    accessToken: state.accessToken,
    isAuthenticated: state.isAuthenticated,
    organizationId: state.organizationId,
    partnerId: state.partnerId,
  }),
}))
