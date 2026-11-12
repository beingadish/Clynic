import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Building2, Plus, MapPin, Hospital, Layers } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Modal,
  Badge,
  EmptyState,
  ErrorState,
  LoadingPanel,
} from '@/components/ui';
import {
  useTenant,
  useFacilities,
  useDepartments,
  useCreateFacility,
  useCreateDepartment,
} from '@/api/tenants';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/errors';
import { humanize } from '@/lib/utils';

export function Organization() {
  const { user } = useAuth();
  const tenantId = user?.tenantId;
  const tenantQuery = useTenant(tenantId);
  const facilitiesQuery = useFacilities(tenantId);
  const departmentsQuery = useDepartments(tenantId);

  const [facilityOpen, setFacilityOpen] = useState(false);
  const [departmentOpen, setDepartmentOpen] = useState(false);

  const tenant = tenantQuery.data;

  return (
    <>
      <PageHeader
        title="Organization"
        description="Manage your tenant, facilities and departments."
      />

      {/* Tenant summary */}
      <Card className="mb-6">
        <CardBody>
          {tenantQuery.isLoading ? (
            <LoadingPanel />
          ) : tenantQuery.isError ? (
            <ErrorState
              description={getErrorMessage(tenantQuery.error)}
              onRetry={() => tenantQuery.refetch()}
            />
          ) : tenant ? (
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Building2 size={26} />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{tenant.name}</h2>
                  <p className="text-sm text-slate-500">
                    <span className="font-mono text-slate-600">{tenant.slug}</span>
                  </p>
                </div>
              </div>
              <dl className="grid grid-cols-3 gap-6 text-sm">
                <div>
                  <dt className="text-slate-400">Care mode</dt>
                  <dd className="mt-1">
                    <Badge tone="brand">{humanize(tenant.careMode)}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400">Plan</dt>
                  <dd className="mt-1 font-medium text-slate-800">{humanize(tenant.planTier)}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Status</dt>
                  <dd className="mt-1">
                    <Badge tone={tenant.status === 'ACTIVE' ? 'green' : 'amber'}>
                      {humanize(tenant.status)}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Tenant information is unavailable.</p>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Facilities */}
        <Card>
          <CardHeader
            title="Facilities"
            description="Physical sites for your organization."
            actions={
              <Button size="sm" onClick={() => setFacilityOpen(true)}>
                <Plus size={16} />
                Add
              </Button>
            }
          />
          {facilitiesQuery.isLoading ? (
            <LoadingPanel />
          ) : facilitiesQuery.isError ? (
            <ErrorState
              description={getErrorMessage(facilitiesQuery.error)}
              onRetry={() => facilitiesQuery.refetch()}
            />
          ) : (facilitiesQuery.data ?? []).length === 0 ? (
            <EmptyState
              icon={Hospital}
              title="No facilities yet"
              description="Add your first facility to organize your sites."
              action={
                <Button size="sm" onClick={() => setFacilityOpen(true)}>
                  <Plus size={16} />
                  Add facility
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {facilitiesQuery.data!.map((f) => (
                <li key={f.id} className="flex items-start gap-3 px-5 py-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Hospital size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">{f.name}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={12} /> {f.address || 'No address'} · {humanize(f.type) || 'Facility'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Departments */}
        <Card>
          <CardHeader
            title="Departments"
            description="Clinical departments for scheduling."
            actions={
              <Button size="sm" onClick={() => setDepartmentOpen(true)}>
                <Plus size={16} />
                Add
              </Button>
            }
          />
          {departmentsQuery.isLoading ? (
            <LoadingPanel />
          ) : departmentsQuery.isError ? (
            <ErrorState
              description={getErrorMessage(departmentsQuery.error)}
              onRetry={() => departmentsQuery.refetch()}
            />
          ) : (departmentsQuery.data ?? []).length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No departments yet"
              description="Departments are used when booking appointments."
              action={
                <Button size="sm" onClick={() => setDepartmentOpen(true)}>
                  <Plus size={16} />
                  Add department
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {departmentsQuery.data!.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <Layers size={16} />
                    </span>
                    <p className="text-sm font-medium text-slate-900">{d.name}</p>
                  </div>
                  <Badge tone="slate">{d.code}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {tenantId ? (
        <>
          <AddFacilityModal
            open={facilityOpen}
            onClose={() => setFacilityOpen(false)}
            tenantId={tenantId}
          />
          <AddDepartmentModal
            open={departmentOpen}
            onClose={() => setDepartmentOpen(false)}
            tenantId={tenantId}
          />
        </>
      ) : null}
    </>
  );
}

// ---------------------------------------------------------------------------

function AddFacilityModal({
  open,
  onClose,
  tenantId,
}: {
  open: boolean;
  onClose: () => void;
  tenantId: string;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [address, setAddress] = useState('');
  const mutation = useCreateFacility(tenantId);

  function reset() {
    setName('');
    setType('');
    setAddress('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await mutation.mutateAsync({ name: name.trim(), type: type.trim(), address: address.trim() });
      toast.success('Facility added.');
      reset();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not add facility.'));
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add facility"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="facility-form" isLoading={mutation.isPending}>
            Add facility
          </Button>
        </>
      }
    >
      <form id="facility-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="e.g. HOSPITAL, CLINIC, LAB"
        />
        <Input
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </form>
    </Modal>
  );
}

function AddDepartmentModal({
  open,
  onClose,
  tenantId,
}: {
  open: boolean;
  onClose: () => void;
  tenantId: string;
}) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const mutation = useCreateDepartment(tenantId);

  function reset() {
    setName('');
    setCode('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await mutation.mutateAsync({ name: name.trim(), code: code.trim() });
      toast.success('Department added.');
      reset();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not add department.'));
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add department"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="department-form" isLoading={mutation.isPending}>
            Add department
          </Button>
        </>
      }
    >
      <form id="department-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input
          label="Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. CARD, ORTHO"
          required
        />
      </form>
    </Modal>
  );
}
