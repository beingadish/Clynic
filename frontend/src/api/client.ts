import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { config, STORAGE_KEYS } from '@/config';
import type { AuthTokens } from '@/types';

/** In-memory + localStorage token store shared across the app. */
export const tokenStore = {
  get access(): string | null {
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  },
  get refresh(): string | null {
    return localStorage.getItem(STORAGE_KEYS.refreshToken);
  },
  set(tokens: AuthTokens) {
    localStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
  },
  clear() {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
  },
};

/**
 * Called when a refresh attempt fails and the session is no longer valid.
 * The AuthProvider registers a handler here so it can clear state + redirect.
 */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20_000,
});

// --- Request interceptor: attach the bearer token -------------------------
apiClient.interceptors.request.use((request: InternalAxiosRequestConfig) => {
  const token = tokenStore.access;
  if (token && request.headers) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

// --- Response interceptor: single-flight refresh on 401 -------------------
interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

/** Refresh raw client (no interceptors) to avoid recursive 401 handling. */
async function performRefresh(): Promise<string | null> {
  const refreshToken = tokenStore.refresh;
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post<AuthTokens>(
      `${config.apiBaseUrl}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    );
    tokenStore.set(data);
    return data.accessToken;
  } catch {
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const isAuthEndpoint = original?.url?.includes('/auth/');

    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true;

      // Coalesce concurrent 401s into a single refresh request.
      refreshPromise ??= performRefresh().finally(() => {
        refreshPromise = null;
      });

      const newToken = await refreshPromise;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }

      // Refresh failed — tear down the session.
      tokenStore.clear();
      onUnauthorized?.();
    }

    return Promise.reject(error);
  },
);
