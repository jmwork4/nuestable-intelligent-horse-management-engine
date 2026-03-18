import { useState } from 'react';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import { PageHeader, Card, CardTitle, Button, Input, Select, DataTable, type Column, Modal, LoadingSpinner } from '@/components/ui';
import { useFeedLogs, useCreateFeedLog } from '@/api/operations';
import { useHorses } from '@/api/horses';
import { useAuthStore } from '@/stores/auth';
import { formatDateTime } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { FeedType } from '@nuestable/shared';
import type { FeedLog } from '@nuestable/shared';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function FeedLogPage() {
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [date] = useState(dayjs().format('YYYY-MM-DD'));
  const { data: feedLogs = [], isLoading } = useFeedLogs({ date });
  const { data: horsesData } = useHorses({ limit: 100 });
  const createMutation = useCreateFeedLog();

  const horses = horsesData?.data ?? [];

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      horseId: '',
      feedType: FeedType.HAY,
      productName: '',
      quantityLbs: '',
      notes: '',
    },
  });

  const onSubmit = (data: Record<string, string>) => {
    createMutation.mutate(
      {
        organizationId: user?.organizationId ?? '',
        horseId: data.horseId ?? '',
        feedType: data.feedType as FeedType,
        productName: data.productName ?? '',
        quantityLbs: parseFloat(data.quantityLbs ?? '0'),
        fedAt: new Date().toISOString(),
        fedBy: user?.id ?? '',
        notes: data.notes || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Feed log entry created');
          reset();
          setShowForm(false);
        },
        onError: () => toast.error('Failed to create feed log'),
      },
    );
  };

  const columns: Column<FeedLog>[] = [
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
      header: 'Type',
      render: (log) => <span>{log.feedType.replace(/_/g, ' ')}</span>,
    },
    {
      key: 'product',
      header: 'Product',
      render: (log) => <span>{log.productName}</span>,
    },
    {
      key: 'qty',
      header: 'Qty (lbs)',
      render: (log) => <span className="font-mono">{log.quantityLbs}</span>,
    },
    {
      key: 'time',
      header: 'Fed At',
      render: (log) => <span className="text-sm text-gray-500">{formatDateTime(log.fedAt)}</span>,
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (log) => <span className="text-sm text-gray-500 truncate max-w-[200px] block">{log.notes || '--'}</span>,
    },
  ];

  const feedTypeOptions = Object.values(FeedType).map((t) => ({ label: t.replace(/_/g, ' '), value: t }));
  const horseOptions = horses.map((h) => ({ label: h.name, value: h.id }));

  return (
    <div>
      <PageHeader
        title="Feed Log"
        subtitle={dayjs(date).format('dddd, MMMM D, YYYY')}
        breadcrumbs={[
          { label: 'Operations', href: '/operations/checklist' },
          { label: 'Feed Log' },
        ]}
        actions={
          <Button icon={<PlusIcon className="h-4 w-4" />} onClick={() => setShowForm(true)}>
            Log Feeding
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={feedLogs}
        loading={isLoading}
        rowKey={(log) => log.id}
        emptyMessage="No feed logs for today"
      />

      {/* Quick entry modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Log Feeding">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select label="Horse" options={horseOptions} placeholder="Select horse" {...register('horseId', { required: true })} />
          <Select label="Feed Type" options={feedTypeOptions} {...register('feedType')} />
          <Input label="Product Name" placeholder="e.g. Timothy Hay" {...register('productName', { required: true })} />
          <Input label="Quantity (lbs)" type="number" step="0.5" {...register('quantityLbs', { required: true })} />
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
