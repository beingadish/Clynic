import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, CalendarDays, CalendarClock, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import {
  Button,
  Card,
  Select,
  StatusBadge,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  EmptyState,
  ErrorState,
  LoadingPanel,
} from '@/components/ui';
import { useAppointments, useCancelAppointment } from '@/api/appointments';
import { usePatients } from '@/api/patients';
import { useDepartments } from '@/api/tenants';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/errors';
import { formatDateTime } from '@/lib/utils';
import type { AppointmentResponse, AppointmentStatus } from '@/types';
import { AppointmentFormModal } from './appointments/AppointmentFormModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';

const STATUS_FILTERS: Array<{ value: 'ALL' | AppointmentStatus; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'BOOKED', label: 'Booked' },
  { value: 'CHECKED_IN', label: 'Checked in' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export function Appointments() {
  const { user, hasRole } = useAuth();
  const appointmentsQuery = useAppointments();
  const patientsQuery = usePatients();
  const departmentsQuery = useDepartments(user?.tenantId);
  const cancelMutation = useCancelAppointment();

  const canManage = hasRole('TENANT_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST');

  const [statusFilter, setStatusFilter] = useState<'ALL' | AppointmentStatus>('ALL');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AppointmentResponse | null>(null);
  const [toCancel, setToCancel] = useState<AppointmentResponse | null>(null);

  const patients = patientsQuery.data ?? [];
  const departments = departmentsQuery.data ?? [];

  const patientName = useMemo(() => {
    const map = new Map(patients.map((p) => [p.id, p.name]));
    return (id: string) => map.get(id) ?? id;
  }, [patients]);

  const departmentName = useMemo(() => {
    const map = new Map(departments.map((d) => [d.id, d.name]));
    return (id: string) => map.get(id) ?? id;
  }, [departments]);

  const filtered = useMemo(() => {
    const list = [...(appointmentsQuery.data ?? [])];
    list.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    if (statusFilter === 'ALL') return list;
    return list.filter((a) => a.status === statusFilter);
  }, [appointmentsQuery.data, statusFilter]);

  function openBook() {
    setEditing(null);
    setFormOpen(true);
  }

  function openReschedule(appt: AppointmentResponse) {
    setEditing(appt);
    setFormOpen(true);
  }

  async function confirmCancel() {
    if (!toCancel) return;
    try {
      await cancelMutation.mutateAsync(toCancel.id);
      toast.success('Appointment cancelled.');
      setToCancel(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not cancel appointment.'));
    }
  }

  return (
    <>
      <PageHeader
        title="Appointments"
        description="Book, reschedule and track appointments."
        actions={
          canManage ? (
            <Button onClick={openBook}>
              <Plus size={18} />
              Book appointment
            </Button>
          ) : undefined
        }
      />

      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div className="w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | AppointmentStatus)}
              aria-label="Filter by status"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {appointmentsQuery.isLoading ? (
          <LoadingPanel label="Loading appointments…" />
        ) : appointmentsQuery.isError ? (
          <ErrorState
            description={getErrorMessage(appointmentsQuery.error)}
            onRetry={() => appointmentsQuery.refetch()}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title={statusFilter === 'ALL' ? 'No appointments yet' : 'No appointments match this filter'}
            description={
              statusFilter === 'ALL'
                ? 'Book your first appointment to see it here.'
                : 'Try selecting a different status.'
            }
            action={
              canManage && statusFilter === 'ALL' ? (
                <Button onClick={openBook}>
                  <Plus size={18} />
                  Book appointment
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Patient</TH>
                <TH>Department</TH>
                <TH>Practitioner</TH>
                <TH>Start</TH>
                <TH>End</TH>
                <TH>Reason</TH>
                <TH>Status</TH>
                {canManage ? <TH className="text-right">Actions</TH> : null}
              </TR>
            </THead>
            <TBody>
              {filtered.map((a) => {
                const active = a.status === 'BOOKED' || a.status === 'CHECKED_IN';
                return (
                  <TR key={a.id}>
                    <TD className="font-medium text-slate-900">{patientName(a.patientId)}</TD>
                    <TD>{departmentName(a.departmentId)}</TD>
                    <TD className="text-slate-500">{a.practitionerId}</TD>
                    <TD>{formatDateTime(a.startTime)}</TD>
                    <TD>{formatDateTime(a.endTime)}</TD>
                    <TD className="max-w-[16rem] truncate" title={a.reason}>
                      {a.reason || '—'}
                    </TD>
                    <TD>
                      <StatusBadge status={a.status} />
                    </TD>
                    {canManage ? (
                      <TD className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openReschedule(a)}
                            disabled={!active}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Reschedule appointment"
                            title="Reschedule"
                          >
                            <CalendarClock size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setToCancel(a)}
                            disabled={!active}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Cancel appointment"
                            title="Cancel"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </TD>
                    ) : null}
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </Card>

      <AppointmentFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        appointment={editing}
        patients={patients}
        departments={departments}
      />

      <ConfirmDialog
        open={!!toCancel}
        title="Cancel appointment"
        message={`Cancel the appointment for ${toCancel ? patientName(toCancel.patientId) : ''}? The patient will need to be re-booked.`}
        confirmLabel="Cancel appointment"
        cancelLabel="Keep it"
        destructive
        isLoading={cancelMutation.isPending}
        onConfirm={confirmCancel}
        onClose={() => setToCancel(null)}
      />
    </>
  );
}
