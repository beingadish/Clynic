import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search, Pencil, Trash2, Users, Dog, User } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import {
  Button,
  Card,
  Input,
  Badge,
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
import { usePatients, useDeletePatient } from '@/api/patients';
import { useTenant } from '@/api/tenants';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/errors';
import { ageFromDob, formatDate } from '@/lib/utils';
import type { PatientResponse } from '@/types';
import { PatientFormModal } from './patients/PatientFormModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export function Patients() {
  const { user } = useAuth();
  const { data: tenant } = useTenant(user?.tenantId);
  const patientsQuery = usePatients();
  const deleteMutation = useDeletePatient();

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PatientResponse | null>(null);
  const [toDelete, setToDelete] = useState<PatientResponse | null>(null);

  const defaultSubjectType = tenant?.careMode === 'VETERINARY' ? 'ANIMAL' : 'HUMAN';

  const filtered = useMemo(() => {
    const list = patientsQuery.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q),
    );
  }, [patientsQuery.data, search]);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(patient: PatientResponse) {
    setEditing(patient);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteMutation.mutateAsync(toDelete.id);
      toast.success('Patient deleted.');
      setToDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not delete patient.'));
    }
  }

  return (
    <>
      <PageHeader
        title="Patients"
        description="Manage your organization's patient registry."
        actions={
          <Button onClick={openAdd}>
            <Plus size={18} />
            Add patient
          </Button>
        }
      />

      <Card>
        <div className="border-b border-slate-100 p-4">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search by name, email or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search patients"
            />
          </div>
        </div>

        {patientsQuery.isLoading ? (
          <LoadingPanel label="Loading patients…" />
        ) : patientsQuery.isError ? (
          <ErrorState
            description={getErrorMessage(patientsQuery.error)}
            onRetry={() => patientsQuery.refetch()}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? 'No matching patients' : 'No patients yet'}
            description={
              search
                ? 'Try a different search term.'
                : 'Add your first patient to get started.'
            }
            action={
              !search ? (
                <Button onClick={openAdd}>
                  <Plus size={18} />
                  Add patient
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Type</TH>
                <TH>Contact</TH>
                <TH>Date of birth</TH>
                <TH>Age</TH>
                <TH>Registered</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((p) => {
                const age = ageFromDob(p.dateOfBirth);
                return (
                  <TR key={p.id}>
                    <TD className="font-medium text-slate-900">{p.name}</TD>
                    <TD>
                      <Badge tone={p.subjectType === 'ANIMAL' ? 'amber' : 'blue'}>
                        <span className="mr-1 inline-flex">
                          {p.subjectType === 'ANIMAL' ? <Dog size={12} /> : <User size={12} />}
                        </span>
                        {p.subjectType === 'ANIMAL' ? 'Animal' : 'Human'}
                      </Badge>
                    </TD>
                    <TD>
                      <div className="text-slate-700">{p.email || '—'}</div>
                      <div className="text-xs text-slate-400">{p.phone || '—'}</div>
                    </TD>
                    <TD>{formatDate(p.dateOfBirth)}</TD>
                    <TD>{age !== null ? `${age} yr` : '—'}</TD>
                    <TD>{formatDate(p.registeredDate)}</TD>
                    <TD className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          aria-label={`Edit ${p.name}`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setToDelete(p)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${p.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </Card>

      <PatientFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        patient={editing}
        defaultSubjectType={defaultSubjectType}
      />

      <ConfirmDialog
        open={!!toDelete}
        title="Delete patient"
        message={`Are you sure you want to delete ${toDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  );
}
