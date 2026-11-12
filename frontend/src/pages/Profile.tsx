import { Mail, User, Building2, Fingerprint, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardHeader, CardBody, RoleBadge, Badge } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/api/tenants';
import { initials, humanize } from '@/lib/utils';

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
        <div className="truncate text-sm font-medium text-slate-800">{value}</div>
      </div>
    </div>
  );
}

export function Profile() {
  const { user, tenantSlug } = useAuth();
  const { data: tenant } = useTenant(user?.tenantId);

  if (!user) return null;

  return (
    <>
      <PageHeader title="Profile" description="Your account details." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardBody className="flex flex-col items-center py-8 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-2xl font-semibold text-white">
              {initials(user.fullName)}
            </span>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">{user.fullName}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {user.roles.map((role) => (
                <RoleBadge key={role} role={role} />
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Account information" />
          <CardBody className="divide-y divide-slate-100 py-0">
            <InfoRow icon={User} label="Full name" value={user.fullName} />
            <InfoRow icon={Mail} label="Email" value={user.email} />
            <InfoRow
              icon={ShieldCheck}
              label="Roles"
              value={user.roles.map((r) => humanize(r)).join(', ')}
            />
            <InfoRow
              icon={Building2}
              label="Organization"
              value={
                <span className="flex items-center gap-2">
                  {tenant?.name ?? tenantSlug ?? '—'}
                  {tenant ? <Badge tone="brand">{humanize(tenant.careMode)}</Badge> : null}
                </span>
              }
            />
            <InfoRow
              icon={Fingerprint}
              label="User ID"
              value={<span className="font-mono text-xs text-slate-600">{user.id}</span>}
            />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
