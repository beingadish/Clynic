import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { LoadingPanel } from '@/components/ui';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Dashboard } from '@/pages/Dashboard';
import { Patients } from '@/pages/Patients';
import { Appointments } from '@/pages/Appointments';
import { Organization } from '@/pages/Organization';
import { Profile } from '@/pages/Profile';
import { NotFound } from '@/pages/NotFound';
import type { ReactNode } from 'react';

/** Routes only for signed-out users; authed users go to the dashboard. */
function PublicOnly({ children }: { children: ReactNode }) {
  const { isAuthenticated, isBootstrapping } = useAuth();
  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingPanel />
      </div>
    );
  }
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnly>
            <Register />
          </PublicOnly>
        }
      />

      {/* Authenticated app */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            element={<ProtectedRoute roles={['TENANT_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']} />}
          >
            <Route path="/patients" element={<Patients />} />
          </Route>
          <Route path="/appointments" element={<Appointments />} />
          <Route element={<ProtectedRoute roles={['TENANT_ADMIN']} />}>
            <Route path="/organization" element={<Organization />} />
          </Route>
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
