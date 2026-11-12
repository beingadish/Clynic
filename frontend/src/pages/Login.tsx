import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, Input } from '@/components/ui';
import { getErrorMessage } from '@/lib/errors';
import { AuthLayout } from './AuthLayout';

interface LocationState {
  from?: { pathname?: string };
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from?.pathname ?? '/dashboard';

  const [email, setEmail] = useState('doctor@apexhealth.org');
  const [password, setPassword] = useState('clynic-demo');
  const [tenantSlug, setTenantSlug] = useState('apex-health');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password, tenantSlug: tenantSlug.trim() });
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Login failed. Check your credentials and tenant.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Sign in to Clynic"
      subtitle="Access your organization's workspace"
      footer={
        <p className="text-sm text-slate-500">
          New organization?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="rounded-lg bg-teal-500/10 border border-teal-500/30 p-3 text-xs text-teal-300 flex items-center justify-between">
          <div>
            <span className="font-semibold block text-teal-200">Demo Organization:</span>
            <span className="text-slate-400">apex-health · doctor@apexhealth.org</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setTenantSlug('apex-health');
              setEmail('doctor@apexhealth.org');
              setPassword('clynic-demo');
            }}
            className="px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium hover:bg-teal-500/30 transition text-[11px]"
          >
            Autofill
          </button>
        </div>
        <Input
          label="Organization slug"
          placeholder="e.g. acme-health"
          value={tenantSlug}
          onChange={(e) => setTenantSlug(e.target.value)}
          autoComplete="organization"
          required
          hint="The unique handle chosen when your organization signed up."
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        <Button type="submit" fullWidth isLoading={submitting} size="lg">
          {!submitting ? <LogIn size={18} /> : null}
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
