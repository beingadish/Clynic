import { AxiosError } from 'axios';

interface ApiErrorBody {
  message?: string;
  error?: string;
  detail?: string;
  errors?: Array<{ message?: string; defaultMessage?: string }>;
}

/**
 * Best-effort extraction of a human-readable message from any thrown error,
 * with special handling for the shapes our backend commonly returns.
 */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof AxiosError) {
    if (error.code === 'ERR_NETWORK') {
      return 'Unable to reach the server. Is the API gateway running?';
    }
    const data = error.response?.data as ApiErrorBody | string | undefined;
    if (typeof data === 'string' && data.trim()) return data;
    if (data && typeof data === 'object') {
      if (data.message) return data.message;
      if (data.detail) return data.detail;
      if (data.error) return data.error;
      const first = data.errors?.[0];
      if (first?.defaultMessage) return first.defaultMessage;
      if (first?.message) return first.message;
    }
    if (error.response?.status === 401) return 'Invalid credentials.';
    if (error.response?.status === 403) return 'You do not have access to this resource.';
    if (error.response?.status === 404) return 'Not found.';
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
