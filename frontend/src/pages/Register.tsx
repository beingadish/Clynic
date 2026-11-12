import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, Select } from '@/components/ui';
import { getErrorMessage } from '@/lib/errors';
import type { CareMode } from '@/types';
import { AuthLayout } from './AuthLayout';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [tenantName, setTenantName] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [tenantSlug, setTenantSlug] = useState('');
  const [careMode, setCareMode] = useState<CareMode>('HUMAN');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const effectiveSlug = useMemo(
    () => (slugTouched ? tenantSlug : slugify(tenantName)),
    [slugTouched, tenantSlug, tenantName],
  );

  const passwordError =
    password.length > 0 && password.length < 8 ? 'Use at least 8 characters.' : undefined;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (passwordError) return;
    setSubmitting(true);
    try {
      await register({
        tenantName: tenantName.trim(),
        tenantSlug: effectiveSlug,
        careMode,
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
      toast.success('Organization created. Welcome to Clynic!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your organization"
      subtitle="Onboard your hospital or clinic and become its first administrator."
      footer={
        <p className="text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Organization
          </p>
          <div className="space-y-4">
            <Input
              label="Organization name"
              placeholder="Acme Health"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              required
            />
            <Input
              label="Organization slug"
              placeholder="acme-health"
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setTenantSlug(slugify(e.target.value));
              }}
              required
              hint="Used to sign in. Lowercase letters, numbers and dashes."
            />
            <Select
              label="Care mode"
              value={careMode}
              onChange={(e) => setCareMode(e.target.value as CareMode)}
            >
              <option value="HUMAN">Human — hospital / clinic</option>
              <option value="VETERINARY">Veterinary — animal care</option>
            </Select>
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Administrator account
          </p>
          <div className="space-y-4">
            <Input
              label="Full name"
              placeholder="Dr. Ada Lovelace"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="admin@acme.health"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              error={passwordError}
              required
            />
          </div>
        </div>

        <Button type="submit" fullWidth isLoading={submitting} size="lg">
          {!submitting ? <UserPlus size={18} /> : null}
          Create organization
        </Button>
      </form>
    </AuthLayout>
  );
}
