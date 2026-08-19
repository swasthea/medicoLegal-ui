export function getOptionalEnvValue(name: string): string | undefined {
  const value = import.meta.env[name]
  return value || undefined
}

export function getEnvValueWithFallback(name: string, fallback: string): string {
  const value = import.meta.env[name]
  if (value) return value as string
  if (import.meta.env.PROD && typeof console !== 'undefined') {
    console.warn(`[config] ${name} is not set; falling back to ${fallback}.`)
  }
  return fallback
}

export function getEnvValue(name: string): string {
  const value = import.meta.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value as string
}

export const config = {
  // Sourced entirely from .env.<mode> (see .env.example) — never hardcode a
  // backend origin here. Every environment (development/staging/production/
  // test) must define VITE_MLC_MLR_API_BASE_URL in its own env file so
  // changing the URL never requires a code change.
  apiBaseUrl: getEnvValue('VITE_MLC_MLR_API_BASE_URL'),
} as const

export type AppConfig = typeof config
