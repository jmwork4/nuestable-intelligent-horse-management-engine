import { useState } from 'react';
import { PageHeader, Card, Select, Badge, LoadingSpinner, EmptyState } from '@/components/ui';
import { usePreRaceClearance } from '@/api/health';
import { useHorses } from '@/api/horses';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

const statusConfig = {
  CLEAR: { icon: CheckCircleIcon, color: 'text-green-500', bg: 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800', label: 'CLEAR' },
  HOLD: { icon: ExclamationTriangleIcon, color: 'text-yellow-500', bg: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800', label: 'HOLD' },
  FAIL: { icon: XCircleIcon, color: 'text-red-500', bg: 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800', label: 'FAIL' },
};

export default function PreRaceClearance() {
  const [selectedHorseId, setSelectedHorseId] = useState('');
  const { data: horsesData } = useHorses({ limit: 100 });
  const { data: clearance = [], isLoading } = usePreRaceClearance(selectedHorseId || undefined);

  const horses = horsesData?.data ?? [];
  const horseOptions = [
    { label: 'All horses', value: '' },
    ...horses.map((h) => ({ label: h.name, value: h.id })),
  ];

  return (
    <div>
      <PageHeader
        title="Pre-Race Clearance"
        subtitle="Verify horses are cleared to race"
        breadcrumbs={[
          { label: 'Health', href: '/health/medications' },
          { label: 'Pre-Race Clearance' },
        ]}
      />

      <Card className="mb-6">
        <div className="max-w-sm">
          <Select
            label="Filter by Horse"
            options={horseOptions}
            value={selectedHorseId}
            onChange={(e) => setSelectedHorseId(e.target.value)}
          />
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : clearance.length === 0 ? (
        <EmptyState message="No clearance data available" />
      ) : (
        <div className="space-y-4">
          {clearance.map((item) => {
            const config = statusConfig[item.overallStatus];
            const StatusIcon = config.icon;

            return (
              <Card key={item.horseId} className={cn('border-2', config.bg)}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={cn('h-8 w-8', config.color)} />
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {item.horseName}
                      </h4>
                      <p className="text-sm text-gray-500">Overall Status</p>
                    </div>
                  </div>
                  <Badge
                    color={item.overallStatus === 'CLEAR' ? 'green' : item.overallStatus === 'HOLD' ? 'yellow' : 'red'}
                    size="lg"
                  >
                    {config.label}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {item.checks.map((check, idx) => {
                    const checkConfig = statusConfig[check.status];
                    const CheckIcon = checkConfig.icon;

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
                      >
                        <div className="flex items-center gap-3">
                          <CheckIcon className={cn('h-5 w-5', checkConfig.color)} />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{check.name}</p>
                            <p className="text-xs text-gray-500">{check.detail}</p>
                          </div>
                        </div>
                        <Badge
                          color={check.status === 'CLEAR' ? 'green' : check.status === 'HOLD' ? 'yellow' : 'red'}
                          size="sm"
                        >
                          {check.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
