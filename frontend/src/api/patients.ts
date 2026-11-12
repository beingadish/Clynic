import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { queryKeys } from './queryClient';
import type { PatientRequest, PatientResponse } from '@/types';

export const patientsApi = {
  async list(): Promise<PatientResponse[]> {
    const { data } = await apiClient.get<PatientResponse[]>('/patients');
    return data ?? [];
  },
  async get(id: string): Promise<PatientResponse> {
    const { data } = await apiClient.get<PatientResponse>(`/patients/${id}`);
    return data;
  },
  async create(body: PatientRequest): Promise<PatientResponse> {
    const { data } = await apiClient.post<PatientResponse>('/patients', body);
    return data;
  },
  async update(id: string, body: PatientRequest): Promise<PatientResponse> {
    const { data } = await apiClient.put<PatientResponse>(`/patients/${id}`, body);
    return data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/patients/${id}`);
  },
};

// --- React Query hooks -----------------------------------------------------

export function usePatients() {
  return useQuery({
    queryKey: queryKeys.patients,
    queryFn: patientsApi.list,
  });
}

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PatientRequest) => patientsApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.patients }),
  });
}

export function useUpdatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: PatientRequest }) =>
      patientsApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.patients }),
  });
}

export function useDeletePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patientsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.patients }),
  });
}
