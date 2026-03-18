import { useState } from 'react';
import { PageHeader, Card, Badge, Button, Modal, Input, Select, DataTable, type Column } from '@/components/ui';
import { useVaccinations, useCreateVaccination } from '@/api/health';
import { useHorses } from '@/api/horses';
import { useAuthStore } from '@/stores/auth';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { VaccinationType } from '@nuestable/shared';
import type { VaccinationRecord } from '@nuestable/shared';
import { useForm } from 'react-hook-form';
import { PlusIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

export default function VaccinationManager() {
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const { data: vaccinations = [], isLoading } = useVaccinations();
  const { data: horsesData } = useHorses({ limit: 100 });
  const createMutation = useCreateVaccination();

  const horses = horsesData?.data ?? [];

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      horseId: '',
      type: VaccinationType.INFLUENZA as string,
      vaccineName: '',
      nextDueDate: '',
      notes: '',
    },
  });

  const onSubmit = (data: Record<string, string>) => {
    createMutation.mutate(
      {
        organizationId: user?.organizationId ?? '',
        horseId: data.horseId ?? '',
        type: data.type as VaccinationType,
        vaccineName: data.vaccineName ?? '',
        administeredAt: new Date().toISOString(),
        administeredBy: user?.id ?? '',
        nextDueDate: data.nextDueDate || undefined,
        notes: data.notes || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Vaccination recorded');
          reset();
          setShowForm(false);
        },
        onError: () => toast.error('Failed to record vaccination'),
      },
    );
  };

  const typeOptions = Object.values(VaccinationType).map((t) => ({ label: t.replace(/_/g, ' '), value: t }));
  const horseOptions = horses.map((h) => ({ label: h.name, value: h.id }));

  const columns: Column<VaccinationRecord>[] = [
    {
      key: 'horse',
      header: 'Horse',
      render: (vac) => {
        const horse = horses.find((h) => h.id === vac.horseId);
        return <span className="font-semibold">{horse?.name || vac.horseId}</span>;
      },
    },
    { key: 'type', header: 'Type', render: (vac) => <span>{vac.type.replace(/_/g, ' ')}</span> },
    { key: 'vaccine', header: 'Vaccine', render: (vac) => <span>{vac.vaccineName}</span> },
    { key: 'date', header: 'Given', render: (vac) => <span>{formatDate(vac.administeredAt)}</span> },
    {
      key: 'nextDue',
      header: 'Next Due',
      render: (vac) => {
        if (!vac.nextDueDate) return <span className="text-gray-400">--</span>;
        const overdue = dayjs(vac.nextDueDate).isBefore(dayjs());
        return (
          <Badge color={overdue ? 'red' : 'green'} size="sm" dot>
            {overdue ? 'OVERDUE - ' : ''}{formatDate(vac.nextDueDate)}
          </Badge>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Vaccination Manager"
        breadcrumbs={[
          { label: 'Health', href: '/health/medications' },
          { label: 'Vaccinations' },
        ]}
        actions={
          <Button icon={<PlusIcon className="h-4 w-4" />} onClick={() => setShowForm(true)}>
            Record Vaccination
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={vaccinations}
        loading={isLoading}
        rowKey={(vac) => vac.id}
        emptyMessage="No vaccination records"
      />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Record Vaccination">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select label="Horse" options={horseOptions} placeholder="Select horse" {...register('horseId', { required: true })} />
          <Select label="Type" options={typeOptions} {...register('type')} />
          <Input label="Vaccine Name" placeholder="e.g. Flu-Vac" {...register('vaccineName', { required: true })} />
          <Input label="Next Due Date" type="date" {...register('nextDueDate')} />
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
