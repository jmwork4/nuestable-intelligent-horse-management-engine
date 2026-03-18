import { useState } from 'react';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import { PageHeader, Card, Button, Input, Select, DataTable, type Column, Modal } from '@/components/ui';
import { useTherapyLogs, useCreateTherapyLog } from '@/api/operations';
import { useHorses } from '@/api/horses';
import { useAuthStore } from '@/stores/auth';
import { formatDateTime } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { TherapyType } from '@nuestable/shared';
import type { TherapyLog } from '@nuestable/shared';
import { PlusIcon } from '@heroicons/react/24/outline';

const QUICK_THERAPIES = [
  { type: TherapyType.HOT_WALKER, label: 'Hot Walker', defaultMinutes: 30 },
  { type: TherapyType.COLD_THERAPY, label: 'Cold Therapy', defaultMinutes: 20 },
  { type: TherapyType.HYDROTHERAPY, label: 'Hydrotherapy', defaultMinutes: 15 },
  { type: TherapyType.LASER, label: 'Laser', defaultMinutes: 10 },
  { type: TherapyType.SWIMMING, label: 'Swimming', defaultMinutes: 20 },
  { type: TherapyType.TREADMILL, label: 'Treadmill', defaultMinutes: 30 },
];

export default function TherapyLogPage() {
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [date] = useState(dayjs().format('YYYY-MM-DD'));
  const { data: logs = [], isLoading } = useTherapyLogs({ date });
  const { data: horsesData } = useHorses({ limit: 100 });
  const createMutation = useCreateTherapyLog();

  const horses = horsesData?.data ?? [];

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      horseId: '',
      therapyType: TherapyType.HOT_WALKER as string,
      durationMinutes: '30',
      settings: '',
      notes: '',
    },
  });

  const handleQuickLog = (therapy: typeof QUICK_THERAPIES[number]) => {
    setValue('therapyType', therapy.type);
    setValue('durationMinutes', String(therapy.defaultMinutes));
    setShowForm(true);
  };

  const onSubmit = (data: Record<string, string>) => {
    createMutation.mutate(
      {
        organizationId: user?.organizationId ?? '',
        horseId: data.horseId ?? '',
        therapyType: data.therapyType as TherapyType,
        durationMinutes: parseInt(data.durationMinutes ?? '0', 10),
        performedAt: new Date().toISOString(),
        performedBy: user?.id ?? '',
        settings: data.settings || undefined,
        notes: data.notes || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Therapy session logged');
          reset();
          setShowForm(false);
        },
        onError: () => toast.error('Failed to log therapy'),
      },
    );
  };

  const columns: Column<TherapyLog>[] = [
    {
      key: 'horse',
      header: 'Horse',
      render: (log) => {
        const horse = horses.find((h) => h.id === log.horseId);
        return <span className="font-semibold">{horse?.name || log.horseId}</span>;
      },
    },
    {
      key: 'type',
      header: 'Therapy',
      render: (log) => <span>{log.therapyType.replace(/_/g, ' ')}</span>,
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (log) => <span className="font-mono">{log.durationMinutes} min</span>,
    },
    {
      key: 'time',
      header: 'Time',
      render: (log) => <span className="text-sm text-gray-500">{formatDateTime(log.performedAt)}</span>,
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (log) => <span className="text-sm text-gray-500 truncate max-w-[200px] block">{log.notes || '--'}</span>,
    },
  ];

  const therapyTypeOptions = Object.values(TherapyType).map((t) => ({ label: t.replace(/_/g, ' '), value: t }));
  const horseOptions = horses.map((h) => ({ label: h.name, value: h.id }));

  return (
    <div>
      <PageHeader
        title="Therapy Log"
        subtitle={dayjs(date).format('dddd, MMMM D, YYYY')}
        breadcrumbs={[
          { label: 'Operations', href: '/operations/checklist' },
          { label: 'Therapy' },
        ]}
        actions={
          <Button icon={<PlusIcon className="h-4 w-4" />} onClick={() => setShowForm(true)}>
            Log Session
          </Button>
        }
      />

      {/* Quick entry buttons */}
      <Card className="mb-6">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Log</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_THERAPIES.map((therapy) => (
            <Button
              key={therapy.type}
              variant="secondary"
              size="sm"
              onClick={() => handleQuickLog(therapy)}
            >
              {therapy.label} ({therapy.defaultMinutes}m)
            </Button>
          ))}
        </div>
      </Card>

      <DataTable
        columns={columns}
        data={logs}
        loading={isLoading}
        rowKey={(log) => log.id}
        emptyMessage="No therapy logs for today"
      />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Log Therapy Session">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select label="Horse" options={horseOptions} placeholder="Select horse" {...register('horseId', { required: true })} />
          <Select label="Therapy Type" options={therapyTypeOptions} {...register('therapyType')} />
          <Input label="Duration (minutes)" type="number" {...register('durationMinutes', { required: true })} />
          <Input label="Settings" placeholder="Temperature, intensity, etc." {...register('settings')} />
          <Input label="Notes" placeholder="Optional notes" {...register('notes')} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
