import { useState } from 'react';
import { PageHeader, Card, CardTitle, Select, Badge, LoadingSpinner, EmptyState } from '@/components/ui';
import { useHorses } from '@/api/horses';
import { useEligibility } from '@/api/races';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

export default function EligibilityChecker() {
  const [selectedHorseId, setSelectedHorseId] = useState('');
  const { data: horsesData } = useHorses({ limit: 100 });
  const { data: eligibility, isLoading } = useEligibility(selectedHorseId || undefined);

  const horses = horsesData?.data ?? [];
  const horseOptions = [
    { label: 'Select a horse...', value: '' },
    ...horses.map((h) => ({ label: h.name, value: h.id })),
  ];

  return (
    <div>
      <PageHeader
        title="Eligibility Checker"
        subtitle="Check which upcoming races your horse qualifies for"
        breadcrumbs={[
          { label: 'Races', href: '/races' },
          { label: 'Eligibility' },
        ]}
      />

      <Card className="mb-6">
        <div className="max-w-sm">
          <Select
            label="Select Horse"
            options={horseOptions}
            value={selectedHorseId}
            onChange={(e) => setSelectedHorseId(e.target.value)}
          />
        </div>
      </Card>

      {!selectedHorseId ? (
        <EmptyState message="Select a horse to check race eligibility" />
      ) : isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : !eligibility || eligibility.length === 0 ? (
        <EmptyState message="No upcoming races found for eligibility checking" />
      ) : (
        <div className="space-y-4">
          {eligibility.map((check) => {
            const passedCount = check.reasons.filter((r) => r.passed).length;
            const totalCount = check.reasons.length;
            const confidence = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

            return (
              <Card key={check.raceId}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      Race {check.raceId}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      color={check.eligible ? 'green' : 'red'}
                      size="lg"
                    >
                      {check.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                    </Badge>
                    <Badge color={confidence >= 80 ? 'green' : confidence >= 50 ? 'yellow' : 'red'} size="sm">
                      {confidence}% match
                    </Badge>
                  </div>
                </div>

                {/* Eligibility reasons */}
                <div className="space-y-2">
                  {check.reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      {reason.passed ? (
                        <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-green-500 mt-0.5" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{reason.rule}</p>
                        <p className="text-xs text-gray-500">{reason.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
