import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { queryKeys } from './queryClient';
import type {
  CreateDepartmentRequest,
  CreateFacilityRequest,
  Department,
  Facility,
  Tenant,
} from '@/types';

export const tenantsApi = {
  async get(id: string): Promise<Tenant> {
    const { data } = await apiClient.get<Tenant>(`/tenants/${id}`);
    return data;
  },
  async listFacilities(id: string): Promise<Facility[]> {
    const { data } = await apiClient.get<Facility[]>(`/tenants/${id}/facilities`);
    return data ?? [];
  },
  async createFacility(id: string, body: CreateFacilityRequest): Promise<Facility> {
    const { data } = await apiClient.post<Facility>(`/tenants/${id}/facilities`, body);
    return data;
  },
  async listDepartments(id: string): Promise<Department[]> {
    const { data } = await apiClient.get<Department[]>(`/tenants/${id}/departments`);
    return data ?? [];
  },
  async createDepartment(id: string, body: CreateDepartmentRequest): Promise<Department> {
    const { data } = await apiClient.post<Department>(`/tenants/${id}/departments`, body);
    return data;
  },
};

// --- React Query hooks -----------------------------------------------------

export function useTenant(id: string | undefined) {
  return useQuery({
    queryKey: id ? queryKeys.tenant(id) : ['tenants', 'none'],
    queryFn: () => tenantsApi.get(id!),
    enabled: !!id,
  });
}

export function useFacilities(tenantId: string | undefined) {
  return useQuery({
    queryKey: tenantId ? queryKeys.facilities(tenantId) : ['tenants', 'none', 'facilities'],
    queryFn: () => tenantsApi.listFacilities(tenantId!),
    enabled: !!tenantId,
  });
}

export function useDepartments(tenantId: string | undefined) {
  return useQuery({
    queryKey: tenantId ? queryKeys.departments(tenantId) : ['tenants', 'none', 'departments'],
    queryFn: () => tenantsApi.listDepartments(tenantId!),
    enabled: !!tenantId,
  });
}

export function useCreateFacility(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateFacilityRequest) => tenantsApi.createFacility(tenantId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.facilities(tenantId) }),
  });
}

export function useCreateDepartment(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDepartmentRequest) => tenantsApi.createDepartment(tenantId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.departments(tenantId) }),
  });
}
