import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, StatusBadge, CountdownTimer, EmptyState } from '@/components/ui';
import { formatDate, formatDistance } from '@/lib/utils';
import { useRaces } from '@/api/races';
import { TrophyIcon } from '@heroicons/react/24/outline';

export function UpcomingRaces() {
  const { data, isLoading } = useRaces({ limit: 5, status: 'SCHEDULED' as never });

  const races = data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Races</CardTitle>
        <Link to="/races" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          View all
        </Link>
      </CardHeader>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : races.length === 0 ? (
        <EmptyState
          icon={<TrophyIcon className="mx-auto h-8 w-8" />}
          message="No upcoming races scheduled"
        />
      ) : (
        <div className="space-y-3">
          {races.map((race) => (
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
                  {formatDate(race.raceDate)} &middot; {formatDistance(race.distance)} &middot; {race.surface}
                </p>
                <div className="mt-1">
                  <StatusBadge status={race.status} type="race" size="sm" />
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <CountdownTimer targetDate={race.postTime} size="sm" />
                <p className="text-xs text-gray-400 mt-1">
                  {race.entries.length} entries
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
