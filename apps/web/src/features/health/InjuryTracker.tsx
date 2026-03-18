import { useState } from 'react';
import { PageHeader, Card, StatusBadge, Badge, Button, Modal, Input, Select, EmptyState, LoadingSpinner } from '@/components/ui';
import { useInjuries, useCreateInjury, useUpdateInjury } from '@/api/health';
import { useHorses } from '@/api/horses';
import { useAuthStore } from '@/stores/auth';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { InjuryStatus } from '@nuestable/shared';
import type { InjuryRecord } from '@nuestable/shared';
import { useForm } from 'react-hook-form';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function InjuryTracker() {
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const { data: injuries = [], isLoading } = useInjuries({ active: true });
  const { data: horsesData } = useHorses({ limit: 100 });
  const createMutation = useCreateInjury();
  const updateMutation = useUpdateInjury();

  const horses = horsesData?.data ?? [];

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      horseId: '',
      description: '',
      location: '',
      severity: 'MODERATE' as string,
      treatmentPlan: '',
      notes: '',
    },
  });

  const onSubmit = (data: Record<string, string>) => {
    createMutation.mutate(
      {
        organizationId: user?.organizationId ?? '',
        horseId: data.horseId ?? '',
        description: data.description ?? '',
        location: data.location ?? '',
        severity: data.severity as 'MILD' | 'MODERATE' | 'SEVERE',
        occurredAt: new Date().toISOString(),
        treatmentPlan: data.treatmentPlan || undefined,
        notes: data.notes || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Injury recorded');
          reset();
          setShowForm(false);
        },
        onError: () => toast.error('Failed to record injury'),
      },
    );
  };

  const markResolved = (injury: InjuryRecord) => {
    updateMutation.mutate({
      id: injury.id,
      status: InjuryStatus.RESOLVED,
      resolvedAt: new Date(),
    });
  };

  const horseOptions = horses.map((h) => ({ label: h.name, value: h.id }));
  const severityOptions = [
    { label: 'Mild', value: 'MILD' },
    { label: 'Moderate', value: 'MODERATE' },
    { label: 'Severe', value: 'SEVERE' },
  ];

  return (
    <div>
      <PageHeader
        title="Injury Tracker"
        breadcrumbs={[
          { label: 'Health', href: '/health/medications' },
          { label: 'Injuries' },
        ]}
        actions={
          <Button icon={<PlusIcon className="h-4 w-4" />} onClick={() => setShowForm(true)}>
            Report Injury
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : injuries.length === 0 ? (
        <EmptyState
          title="No active injuries"
          message="All horses are injury-free"
        />
      ) : (
        <div className="space-y-4">
          {injuries.map((injury) => {
            const horse = horses.find((h) => h.id === injury.horseId);
            return (
              <Card key={injury.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {horse?.name || injury.horseId}
                      </h4>
                      <StatusBadge status={injury.status} type="injury" />
                      <Badge
                        color={injury.severity === 'SEVERE' ? 'red' : injury.severity === 'MODERATE' ? 'yellow' : 'green'}
                        size="sm"
                      >
                        {injury.severity}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{injury.description}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Location: {injury.location} &middot; Occurred: {formatDate(injury.occurredAt)}
                    </p>
                    {injury.treatmentPlan && (
                      <div className="mt-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                        <p className="text-xs font-medium text-gray-500 mb-1">Treatment Plan</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{injury.treatmentPlan}</p>
                      </div>
                    )}
                  </div>
                  {injury.status !== 'RESOLVED' && (
                    <Button variant="secondary" size="sm" onClick={() => markResolved(injury)}>
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Report Injury">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select label="Horse" options={horseOptions} placeholder="Select horse" {...register('horseId', { required: true })} />
          <Input label="Description" {...register('description', { required: true })} />
          <Input label="Location" placeholder="e.g. Left front cannon" {...register('location', { required: true })} />
          <Select label="Severity" options={severityOptions} {...register('severity')} />
          <Input label="Treatment Plan" {...register('treatmentPlan')} />
          <Input label="Notes" {...register('notes')} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Report</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
