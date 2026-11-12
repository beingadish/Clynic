import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Modal, Button, Input, Select } from '@/components/ui';
import { useCreatePatient, useUpdatePatient } from '@/api/patients';
import { getErrorMessage } from '@/lib/errors';
import type { PatientRequest, PatientResponse, SubjectType } from '@/types';

interface PatientFormModalProps {
  open: boolean;
  onClose: () => void;
  patient?: PatientResponse | null;
  /** Default subject type for new patients (driven by tenant care mode). */
  defaultSubjectType?: SubjectType;
}

const emptyForm: PatientRequest = {
  name: '',
  email: '',
  dateOfBirth: '',
  address: '',
  phone: '',
  subjectType: 'HUMAN',
};

export function PatientFormModal({
  open,
  onClose,
  patient,
  defaultSubjectType = 'HUMAN',
}: PatientFormModalProps) {
  const isEdit = !!patient;
  const [form, setForm] = useState<PatientRequest>(emptyForm);
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();
  const saving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!open) return;
    if (patient) {
      setForm({
        name: patient.name,
        email: patient.email,
        dateOfBirth: patient.dateOfBirth,
        address: patient.address,
        phone: patient.phone,
        subjectType: patient.subjectType,
      });
    } else {
      setForm({ ...emptyForm, subjectType: defaultSubjectType });
    }
  }, [open, patient, defaultSubjectType]);

  function update<K extends keyof PatientRequest>(key: K, value: PatientRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload: PatientRequest = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
    };
    try {
      if (isEdit && patient) {
        await updateMutation.mutateAsync({ id: patient.id, body: payload });
        toast.success('Patient updated.');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Patient added.');
      }
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save patient.'));
    }
  }

  const isAnimal = form.subjectType === 'ANIMAL';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit patient' : 'Add patient'}
      description={
        isEdit ? 'Update this record.' : 'Register a new patient in your organization.'
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="patient-form" isLoading={saving}>
            {isEdit ? 'Save changes' : 'Add patient'}
          </Button>
        </>
      }
    >
      <form id="patient-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Select
          label="Subject type"
          value={form.subjectType}
          onChange={(e) => update('subjectType', e.target.value as SubjectType)}
        >
          <option value="HUMAN">Human</option>
          <option value="ANIMAL">Animal</option>
        </Select>
        <Input
          label={isAnimal ? 'Name (animal / owner)' : 'Full name'}
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          required
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
          />
        </div>
        <Input
          label={isAnimal ? 'Date of birth (or est.)' : 'Date of birth'}
          type="date"
          value={form.dateOfBirth}
          onChange={(e) => update('dateOfBirth', e.target.value)}
          required
        />
        <Input
          label="Address"
          value={form.address}
          onChange={(e) => update('address', e.target.value)}
        />
      </form>
    </Modal>
  );
}
