import { apiClient } from './client';
import type {
  AuthResponse,
  AuthTokens,
  LoginRequest,
  RefreshRequest,
  RegisterRequest,
  User,
} from '@/types';

export const authApi = {
  async login(body: LoginRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', body);
    return data;
  },

  async register(body: RegisterRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', body);
    return data;
  },

  async refresh(body: RefreshRequest): Promise<AuthTokens> {
    const { data } = await apiClient.post<AuthTokens>('/auth/refresh', body);
    return data;
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },
};
