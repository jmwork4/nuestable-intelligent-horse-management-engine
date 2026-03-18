import { Card, CardTitle, StatusBadge, Badge, CountdownTimer, EmptyState } from '@/components/ui';
import { useMedications, useVaccinations, useInjuries } from '@/api/health';
import { formatDate, formatDateTime } from '@/lib/utils';
import { ShieldCheckIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

interface HealthTabProps {
  horseId: string;
}

export function HealthTab({ horseId }: HealthTabProps) {
  const { data: medications = [], isLoading: medsLoading } = useMedications({ horseId });
  const { data: vaccinations = [], isLoading: vacsLoading } = useVaccinations(horseId);
  const { data: injuries = [], isLoading: injLoading } = useInjuries({ horseId });

  const activeMeds = medications.filter((m) => m.status === 'ACTIVE');
  const activeInjuries = injuries.filter((i) => i.status !== 'RESOLVED');

  return (
    <div className="space-y-6">
      {/* Active Medications */}
      <Card>
        <CardTitle className="mb-4">Active Medications</CardTitle>
        {medsLoading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-12 rounded bg-gray-100 dark:bg-gray-800" />)}
          </div>
        ) : activeMeds.length === 0 ? (
          <div className="flex items-center gap-3 text-green-600">
            <ShieldCheckIcon className="h-6 w-6" />
            <span className="text-sm font-medium">No active medications</span>
          </div>
        ) : (
          <div className="space-y-3">
            {activeMeds.map((med) => (
              <div
                key={med.id}
                className="flex items-center justify-between rounded-lg border p-3 dark:border-gray-800"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {med.medicationName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {med.dosage} &middot; {med.route} &middot; Administered {formatDateTime(med.administeredAt)}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={med.withdrawalStatus} type="withdrawal" size="sm" />
                  {med.withdrawalStatus !== 'CLEAR' && (
                    <div className="mt-1">
                      <CountdownTimer targetDate={med.withdrawalEndsAt} size="sm" urgentThresholdHours={12} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Vaccinations */}
      <Card>
        <CardTitle className="mb-4">Vaccination Status</CardTitle>
        {vacsLoading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-12 rounded bg-gray-100 dark:bg-gray-800" />)}
          </div>
        ) : vaccinations.length === 0 ? (
          <EmptyState message="No vaccination records" />
        ) : (
          <div className="space-y-3">
            {vaccinations.map((vac) => {
              const isOverdue = vac.nextDueDate && new Date(vac.nextDueDate) < new Date();
              return (
                <div
                  key={vac.id}
                  className="flex items-center justify-between rounded-lg border p-3 dark:border-gray-800"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {vac.type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {vac.vaccineName} &middot; {formatDate(vac.administeredAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    {vac.nextDueDate ? (
                      <Badge color={isOverdue ? 'red' : 'green'} size="sm">
                        {isOverdue ? 'OVERDUE' : `Due ${formatDate(vac.nextDueDate)}`}
                      </Badge>
                    ) : (
                      <Badge color="gray" size="sm">No due date</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Active Injuries */}
      <Card>
        <CardTitle className="mb-4">Injuries</CardTitle>
        {injLoading ? (
          <div className="animate-pulse space-y-2">
            {[1].map((i) => <div key={i} className="h-12 rounded bg-gray-100 dark:bg-gray-800" />)}
          </div>
        ) : activeInjuries.length === 0 ? (
          <div className="flex items-center gap-3 text-green-600">
            <ShieldCheckIcon className="h-6 w-6" />
            <span className="text-sm font-medium">No active injuries</span>
          </div>
        ) : (
          <div className="space-y-3">
            {activeInjuries.map((injury) => (
              <div
                key={injury.id}
                className="rounded-lg border p-3 dark:border-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {injury.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {injury.location} &middot; {formatDate(injury.occurredAt)}
                    </p>
                  </div>
                  <StatusBadge status={injury.status} type="injury" size="sm" />
                </div>
                {injury.treatmentPlan && (
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">{injury.treatmentPlan}</p>
                )}
                <Badge
                  color={injury.severity === 'SEVERE' ? 'red' : injury.severity === 'MODERATE' ? 'yellow' : 'green'}
                  size="sm"
                  className="mt-2"
                >
                  {injury.severity}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
