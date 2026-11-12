import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Never retry auth/permission failures; retry others up to twice.
        if (error instanceof AxiosError) {
          const status = error.response?.status;
          if (status === 401 || status === 403 || status === 404) return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

/** Centralised query keys so invalidation stays consistent across the app. */
export const queryKeys = {
  me: ['auth', 'me'] as const,
  tenant: (id: string) => ['tenants', id] as const,
  facilities: (tenantId: string) => ['tenants', tenantId, 'facilities'] as const,
  departments: (tenantId: string) => ['tenants', tenantId, 'departments'] as const,
  patients: ['patients'] as const,
  patient: (id: string) => ['patients', id] as const,
  appointments: ['appointments'] as const,
  appointment: (id: string) => ['appointments', id] as const,
};
