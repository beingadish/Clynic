/**
 * Runtime configuration. All values are read from Vite env vars (prefixed
 * with `VITE_`) with sensible defaults for local development.
 */
export const config = {
  /** Base URL of the API gateway — every request is routed through it. */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/clynic-api',
} as const;

/** localStorage keys used for auth persistence. */
export const STORAGE_KEYS = {
  accessToken: 'clynic.accessToken',
  refreshToken: 'clynic.refreshToken',
  user: 'clynic.user',
  tenantSlug: 'clynic.tenantSlug',
} as const;
