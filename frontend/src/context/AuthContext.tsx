import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '@/api/auth';
import { setUnauthorizedHandler, tokenStore } from '@/api/client';
import { queryClient } from '@/api/queryClient';
import { STORAGE_KEYS } from '@/config';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Role,
  User,
} from '@/types';

interface AuthContextValue {
  user: User | null;
  tenantSlug: string | null;
  isAuthenticated: boolean;
  /** True while we validate a persisted session on first load. */
  isBootstrapping: boolean;
  login: (body: LoginRequest) => Promise<void>;
  register: (body: RegisterRequest) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): User | null {
  const raw = localStorage.getItem(STORAGE_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function persistUser(user: User | null) {
  if (user) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEYS.user);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [tenantSlug, setTenantSlug] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEYS.tenantSlug),
  );
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(() => !!tokenStore.access);
  // Guard against setting state after logout during an in-flight bootstrap.
  const activeRef = useRef(true);

  const applyAuth = useCallback((res: AuthResponse, slug: string) => {
    tokenStore.set(res);
    persistUser(res.user);
    localStorage.setItem(STORAGE_KEYS.tenantSlug, slug);
    setUser(res.user);
    setTenantSlug(slug);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    persistUser(null);
    localStorage.removeItem(STORAGE_KEYS.tenantSlug);
    setUser(null);
    setTenantSlug(null);
    queryClient.clear();
  }, []);

  // Wire the axios interceptor's "session dead" callback to our logout.
  useEffect(() => {
    setUnauthorizedHandler(() => logout());
  }, [logout]);

  // On first mount with a stored token, confirm the session is still valid.
  useEffect(() => {
    activeRef.current = true;
    if (!tokenStore.access) {
      setIsBootstrapping(false);
      return;
    }
    authApi
      .me()
      .then((fresh) => {
        if (!activeRef.current) return;
        persistUser(fresh);
        setUser(fresh);
      })
      .catch(() => {
        // The 401 interceptor handles refresh/logout; nothing to do here.
      })
      .finally(() => {
        if (activeRef.current) setIsBootstrapping(false);
      });
    return () => {
      activeRef.current = false;
    };
  }, []);

  const login = useCallback(
    async (body: LoginRequest) => {
      const res = await authApi.login(body);
      applyAuth(res, body.tenantSlug);
    },
    [applyAuth],
  );

  const register = useCallback(
    async (body: RegisterRequest) => {
      const res = await authApi.register(body);
      applyAuth(res, body.tenantSlug);
    },
    [applyAuth],
  );

  const hasRole = useCallback(
    (...roles: Role[]) => {
      if (!user) return false;
      if (roles.length === 0) return true;
      return roles.some((r) => user.roles.includes(r));
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tenantSlug,
      isAuthenticated: !!user,
      isBootstrapping,
      login,
      register,
      logout,
      hasRole,
    }),
    [user, tenantSlug, isBootstrapping, login, register, logout, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
