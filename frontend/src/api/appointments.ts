import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { queryKeys } from './queryClient';
import type { AppointmentRequest, AppointmentResponse } from '@/types';

export const appointmentsApi = {
  async list(): Promise<AppointmentResponse[]> {
    const { data } = await apiClient.get<AppointmentResponse[]>('/appointments');
    return data ?? [];
  },
  async get(id: string): Promise<AppointmentResponse> {
    const { data } = await apiClient.get<AppointmentResponse>(`/appointments/${id}`);
    return data;
  },
  async create(body: AppointmentRequest): Promise<AppointmentResponse> {
    const { data } = await apiClient.post<AppointmentResponse>('/appointments', body);
    return data;
  },
  async update(id: string, body: AppointmentRequest): Promise<AppointmentResponse> {
    const { data } = await apiClient.put<AppointmentResponse>(`/appointments/${id}`, body);
    return data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/appointments/${id}`);
  },
};

// --- React Query hooks -----------------------------------------------------

export function useAppointments() {
  return useQuery({
    queryKey: queryKeys.appointments,
    queryFn: appointmentsApi.list,
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AppointmentRequest) => appointmentsApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.appointments }),
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AppointmentRequest }) =>
      appointmentsApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.appointments }),
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.appointments }),
  });
}
