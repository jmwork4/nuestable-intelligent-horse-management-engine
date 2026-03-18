import { useState } from 'react';
import { PageHeader, Card, StatusBadge, CountdownTimer, Badge, Button, Modal, Input, Select, DataTable, type Column, LoadingSpinner } from '@/components/ui';
import { useMedications, useCreateMedication, useWithdrawals } from '@/api/health';
import { useHorses } from '@/api/horses';
import { useAuthStore } from '@/stores/auth';
import { formatDateTime } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { MedicationRoute } from '@nuestable/shared';
import type { MedicationRecord, WithdrawalCountdown } from '@nuestable/shared';
import { useForm } from 'react-hook-form';
import { PlusIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

export default function MedicationLog() {
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const { data: medications = [], isLoading } = useMedications({});
  const { data: withdrawals = [] } = useWithdrawals();
  const { data: horsesData } = useHorses({ limit: 100 });
  const createMutation = useCreateMedication();

  const horses = horsesData?.data ?? [];
  const activeWithdrawals = withdrawals.filter((w) => w.status !== 'CLEAR');

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      horseId: '',
      medicationName: '',
      dosage: '',
      route: MedicationRoute.ORAL as string,
      withdrawalHours: '72',
      notes: '',
    },
  });

  const onSubmit = (data: Record<string, string>) => {
    createMutation.mutate(
      {
        organizationId: user?.organizationId ?? '',
        horseId: data.horseId ?? '',
        medicationName: data.medicationName ?? '',
        dosage: data.dosage ?? '',
        route: data.route as MedicationRoute,
        administeredAt: new Date().toISOString(),
        administeredBy: user?.id ?? '',
        withdrawalHours: parseInt(data.withdrawalHours ?? '72', 10),
        notes: data.notes || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Medication recorded');
          reset();
          setShowForm(false);
        },
        onError: () => toast.error('Failed to record medication'),
      },
    );
  };

  const routeOptions = Object.values(MedicationRoute).map((r) => ({ label: r.replace(/_/g, ' '), value: r }));
  const horseOptions = horses.map((h) => ({ label: h.name, value: h.id }));

  const columns: Column<MedicationRecord>[] = [
    {
      key: 'horse',
      header: 'Horse',
      render: (med) => {
        const horse = horses.find((h) => h.id === med.horseId);
        return <span className="font-semibold">{horse?.name || med.horseId}</span>;
      },
    },
    { key: 'medication', header: 'Medication', render: (med) => <span className="font-medium">{med.medicationName}</span> },
    { key: 'dosage', header: 'Dosage', render: (med) => <span>{med.dosage}</span> },
    { key: 'route', header: 'Route', render: (med) => <Badge color="gray" size="sm">{med.route}</Badge> },
    { key: 'administered', header: 'Administered', render: (med) => <span className="text-sm text-gray-500">{formatDateTime(med.administeredAt)}</span> },
    {
      key: 'withdrawal',
      header: 'Withdrawal',
      render: (med) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={med.withdrawalStatus} type="withdrawal" size="sm" />
          {med.withdrawalStatus !== 'CLEAR' && (
            <CountdownTimer targetDate={med.withdrawalEndsAt} size="sm" urgentThresholdHours={12} />
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Medication Log"
        breadcrumbs={[
          { label: 'Health', href: '/health/medications' },
          { label: 'Medications' },
        ]}
        actions={
          <Button icon={<PlusIcon className="h-4 w-4" />} onClick={() => setShowForm(true)}>
            Record Medication
          </Button>
        }
      />

      {/* Active withdrawal alerts */}
      {activeWithdrawals.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/10">
          <div className="flex items-center gap-2 mb-3">
            <ShieldExclamationIcon className="h-5 w-5 text-red-600" />
            <h3 className="text-sm font-bold text-red-800 dark:text-red-400">
              Active Withdrawal Periods ({activeWithdrawals.length})
            </h3>
          </div>
          <div className="space-y-2">
            {activeWithdrawals.map((w) => (
              <div key={`${w.horseId}-${w.medicationName}`} className="flex items-center justify-between">
                <span className="text-sm text-red-700 dark:text-red-300">
                  {w.horseName} - {w.medicationName}
                </span>
                <CountdownTimer
                  targetDate={w.withdrawalEndsAt}
                  size="sm"
                  urgentThresholdHours={12}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      <DataTable
        columns={columns}
        data={medications}
        loading={isLoading}
        rowKey={(med) => med.id}
        emptyMessage="No medication records"
      />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Record Medication">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select label="Horse" options={horseOptions} placeholder="Select horse" {...register('horseId', { required: true })} />
          <Input label="Medication Name" {...register('medicationName', { required: true })} />
          <Input label="Dosage" placeholder="e.g. 10ml" {...register('dosage', { required: true })} />
          <Select label="Route" options={routeOptions} {...register('route')} />
          <Input label="Withdrawal Period (hours)" type="number" {...register('withdrawalHours', { required: true })} />
          <Input label="Notes" {...register('notes')} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Record</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
