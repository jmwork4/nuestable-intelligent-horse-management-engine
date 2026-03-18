import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, Badge, EmptyState } from '@/components/ui';
import { useRaces } from '@/api/races';
import { formatDate, formatCurrency } from '@/lib/utils';
import { TrophyIcon } from '@heroicons/react/24/outline';

export function RecentResults() {
  const { data, isLoading } = useRaces({ limit: 5, status: 'OFFICIAL' as never });

  const races = data?.data ?? [];

  const getPositionColor = (pos: number): 'gold' | 'gray' | 'yellow' | 'blue' => {
    if (pos === 1) return 'gold';
    if (pos === 2) return 'gray';
    if (pos === 3) return 'yellow';
    return 'blue';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Results</CardTitle>
        <Link to="/races" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          View all
        </Link>
      </CardHeader>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : races.length === 0 ? (
        <EmptyState
          icon={<TrophyIcon className="mx-auto h-8 w-8" />}
          message="No recent race results"
        />
      ) : (
        <div className="space-y-3">
          {races.map((race) => {
            const topResult = race.results.sort((a, b) => a.officialPosition - b.officialPosition)[0];
            return (
              <Link
                key={race.id}
                to={`/races/${race.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {race.trackName} - R{race.raceNumber}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(race.raceDate)}
                  </p>
                </div>
                {topResult && (
                  <div className="text-right flex-shrink-0 ml-3">
                    <Badge color={getPositionColor(topResult.officialPosition)} size="sm">
                      {topResult.horseName} - {topResult.officialPosition}{topResult.officialPosition === 1 ? 'st' : topResult.officialPosition === 2 ? 'nd' : topResult.officialPosition === 3 ? 'rd' : 'th'}
                    </Badge>
                    {topResult.earnings > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        {formatCurrency(topResult.earnings)}
                      </p>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
