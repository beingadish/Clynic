import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Modal, Button, Input, Select, Textarea } from '@/components/ui';
import { useCreateAppointment, useUpdateAppointment } from '@/api/appointments';
import { getErrorMessage } from '@/lib/errors';
import { fromDatetimeLocal, toDatetimeLocal } from '@/lib/utils';
import type {
  AppointmentRequest,
  AppointmentResponse,
  Department,
  PatientResponse,
} from '@/types';

interface AppointmentFormModalProps {
  open: boolean;
  onClose: () => void;
  appointment?: AppointmentResponse | null;
  patients: PatientResponse[];
  departments: Department[];
}

interface FormState {
  patientId: string;
  practitionerId: string;
  departmentId: string;
  startLocal: string;
  endLocal: string;
  reason: string;
}

function initialState(): FormState {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);
  const end = new Date(start.getTime() + 30 * 60_000);
  return {
    patientId: '',
    practitionerId: '',
    departmentId: '',
    startLocal: toDatetimeLocal(start.toISOString()),
    endLocal: toDatetimeLocal(end.toISOString()),
    reason: '',
  };
}

export function AppointmentFormModal({
  open,
  onClose,
  appointment,
  patients,
  departments,
}: AppointmentFormModalProps) {
  const isEdit = !!appointment;
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const saving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (appointment) {
      setForm({
        patientId: appointment.patientId,
        practitionerId: appointment.practitionerId,
        departmentId: appointment.departmentId,
        startLocal: toDatetimeLocal(appointment.startTime),
        endLocal: toDatetimeLocal(appointment.endTime),
        reason: appointment.reason,
      });
    } else {
      setForm(initialState());
    }
  }, [open, appointment]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const startTime = fromDatetimeLocal(form.startLocal);
    const endTime = fromDatetimeLocal(form.endLocal);
    if (!startTime || !endTime) {
      setError('Please provide valid start and end times.');
      return;
    }
    if (new Date(endTime) <= new Date(startTime)) {
      setError('End time must be after the start time.');
      return;
    }
    setError(null);

    const payload: AppointmentRequest = {
      patientId: form.patientId,
      practitionerId: form.practitionerId.trim(),
      departmentId: form.departmentId,
      startTime,
      endTime,
      reason: form.reason.trim(),
    };

    try {
      if (isEdit && appointment) {
        await updateMutation.mutateAsync({ id: appointment.id, body: payload });
        toast.success('Appointment rescheduled.');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Appointment booked.');
      }
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save appointment.'));
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Reschedule appointment' : 'Book appointment'}
      description={
        isEdit ? 'Update the schedule or details.' : 'Schedule a new appointment.'
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="appointment-form" isLoading={saving}>
            {isEdit ? 'Save changes' : 'Book appointment'}
          </Button>
        </>
      }
    >
      <form id="appointment-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Select
          label="Patient"
          value={form.patientId}
          onChange={(e) => update('patientId', e.target.value)}
          required
        >
          <option value="" disabled>
            Select a patient
          </option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Department"
            value={form.departmentId}
            onChange={(e) => update('departmentId', e.target.value)}
            required
            hint={departments.length === 0 ? 'No departments found — add one in Organization.' : undefined}
          >
            <option value="" disabled>
              Select a department
            </option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
          <Input
            label="Practitioner ID"
            value={form.practitionerId}
            onChange={(e) => update('practitionerId', e.target.value)}
            placeholder="e.g. user id of the doctor"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Start time"
            type="datetime-local"
            value={form.startLocal}
            onChange={(e) => update('startLocal', e.target.value)}
            required
          />
          <Input
            label="End time"
            type="datetime-local"
            value={form.endLocal}
            onChange={(e) => update('endLocal', e.target.value)}
            required
          />
        </div>

        <Textarea
          label="Reason"
          value={form.reason}
          onChange={(e) => update('reason', e.target.value)}
          placeholder="Reason for the visit"
          rows={3}
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </Modal>
  );
}
