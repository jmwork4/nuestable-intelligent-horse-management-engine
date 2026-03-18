import { Card, CardHeader, CardTitle, CountdownTimer, EmptyState, Badge } from '@/components/ui';
import { useWithdrawals } from '@/api/health';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

export function ActiveWithdrawals() {
  const { data: withdrawals = [], isLoading } = useWithdrawals();
  const active = withdrawals.filter((w) => w.status !== 'CLEAR');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Active Withdrawals</CardTitle>
          {active.length > 0 && (
            <Badge color="red" size="sm">{active.length}</Badge>
          )}
        </div>
      </CardHeader>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : active.length === 0 ? (
        <EmptyState
          icon={<ShieldExclamationIcon className="mx-auto h-8 w-8" />}
          message="All horses are clear"
        />
      ) : (
        <div className="space-y-3">
          {active.map((w) => (
            <div
              key={`${w.horseId}-${w.medicationName}`}
              className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/50 p-3 dark:border-red-900/30 dark:bg-red-900/10"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {w.horseName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {w.medicationName}
                </p>
              </div>
              <CountdownTimer
                targetDate={w.withdrawalEndsAt}
                urgentThresholdHours={12}
                size="sm"
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
