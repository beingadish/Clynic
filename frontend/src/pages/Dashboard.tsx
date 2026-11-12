import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, CalendarClock, Building2, CalendarCheck, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import {
  StatTile,
  Card,
  CardHeader,
  CardBody,
  StatusBadge,
  EmptyState,
  LoadingPanel,
  ErrorState,
  Badge,
} from '@/components/ui';
import { usePatients } from '@/api/patients';
import { useAppointments } from '@/api/appointments';
import { useDepartments, useTenant } from '@/api/tenants';
import { useAuth } from '@/context/AuthContext';
import { formatDateTime, humanize } from '@/lib/utils';
import { getErrorMessage } from '@/lib/errors';
import type { AppointmentResponse } from '@/types';

function isUpcoming(a: AppointmentResponse): boolean {
  return (
    (a.status === 'BOOKED' || a.status === 'CHECKED_IN') &&
    new Date(a.startTime).getTime() >= Date.now() - 60 * 60_000
  );
}

export function Dashboard() {
  const { user, hasRole } = useAuth();
  const isPatient = hasRole('PATIENT') && !hasRole('TENANT_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST');
  const canSeePatients = hasRole('TENANT_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST');

  const { data: tenant } = useTenant(user?.tenantId);
  const patientsQuery = usePatients();
  const appointmentsQuery = useAppointments();
  const departmentsQuery = useDepartments(user?.tenantId);

  const appointments = appointmentsQuery.data ?? [];
  const upcoming = useMemo(
    () =>
      [...appointments]
        .filter(isUpcoming)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [appointments],
  );

  const recent = useMemo(
    () =>
      [...appointments]
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, 6),
    [appointments],
  );

  const patientNameById = useMemo(() => {
    const map = new Map((patientsQuery.data ?? []).map((p) => [p.id, p.name]));
    return (id: string) => map.get(id) ?? id;
  }, [patientsQuery.data]);

  const firstName = user?.fullName?.split(' ')[0] ?? 'there';

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={
          tenant
            ? `${tenant.name} · ${humanize(tenant.careMode)} care`
            : 'Here is what is happening today.'
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {canSeePatients ? (
          <StatTile
            label="Patients"
            value={patientsQuery.data?.length ?? 0}
            icon={Users}
            accent="brand"
            isLoading={patientsQuery.isLoading}
            hint="Total registered"
          />
        ) : null}
        <StatTile
          label="Upcoming appointments"
          value={upcoming.length}
          icon={CalendarClock}
          accent="blue"
          isLoading={appointmentsQuery.isLoading}
          hint="Booked or checked in"
        />
        {!isPatient ? (
          <StatTile
            label="Departments"
            value={departmentsQuery.data?.length ?? 0}
            icon={Building2}
            accent="purple"
            isLoading={departmentsQuery.isLoading}
            hint="Across your organization"
          />
        ) : (
          <StatTile
            label="Completed visits"
            value={appointments.filter((a) => a.status === 'COMPLETED').length}
            icon={CalendarCheck}
            accent="green"
            isLoading={appointmentsQuery.isLoading}
          />
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent appointments */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Recent appointments"
              actions={
                <Link
                  to="/appointments"
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  View all <ArrowRight size={14} />
                </Link>
              }
            />
            {appointmentsQuery.isLoading ? (
              <LoadingPanel />
            ) : appointmentsQuery.isError ? (
              <ErrorState
                description={getErrorMessage(appointmentsQuery.error)}
                onRetry={() => appointmentsQuery.refetch()}
              />
            ) : recent.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="No appointments yet"
                description="Once appointments are booked they will appear here."
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {recent.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-4 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {patientNameById(a.patientId)}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {formatDateTime(a.startTime)}
                        {a.reason ? ` · ${a.reason}` : ''}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Side panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Next up" />
            <CardBody>
              {appointmentsQuery.isLoading ? (
                <LoadingPanel />
              ) : upcoming.length === 0 ? (
                <p className="text-sm text-slate-500">No upcoming appointments.</p>
              ) : (
                <ul className="space-y-3">
                  {upcoming.slice(0, 4).map((a) => (
                    <li key={a.id} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                        <CalendarClock size={16} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {patientNameById(a.patientId)}
                        </p>
                        <p className="text-xs text-slate-500">{formatDateTime(a.startTime)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          {tenant ? (
            <Card>
              <CardHeader title="Organization" />
              <CardBody>
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Care mode</dt>
                    <dd>
                      <Badge tone="brand">{humanize(tenant.careMode)}</Badge>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Plan</dt>
                    <dd className="font-medium text-slate-800">{humanize(tenant.planTier)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Status</dt>
                    <dd>
                      <Badge tone={tenant.status === 'ACTIVE' ? 'green' : 'amber'}>
                        {humanize(tenant.status)}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </CardBody>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
