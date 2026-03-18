import { useNavigate } from 'react-router-dom';
import { PageHeader, Card, CardTitle, StatusBadge, CountdownTimer, Badge, LoadingSpinner, EmptyState } from '@/components/ui';
import { useRaceDashboard } from '@/api/races';
import { formatDistance, formatCurrency } from '@/lib/utils';
import { TrophyIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

export default function RaceDayDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useRaceDashboard();
  const races = data?.races ?? [];

  return (
    <div>
      <PageHeader
        title="Race Day"
        subtitle={dayjs().format('dddd, MMMM D, YYYY')}
        breadcrumbs={[
          { label: 'Races', href: '/races' },
          { label: 'Today' },
        ]}
      />

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : races.length === 0 ? (
        <EmptyState
          icon={<TrophyIcon className="mx-auto h-12 w-12" />}
          title="No races today"
          message="Check back later or view the full race calendar"
          action={{ label: 'View Calendar', onClick: () => navigate('/races') }}
        />
      ) : (
        <div className="space-y-6">
          {races.map((race) => (
            <Card key={race.id} padding="none" className="overflow-hidden">
              {/* Race header */}
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      Race {race.raceNumber}
                    </h3>
                    <StatusBadge status={race.status} type="race" />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {race.trackName} &middot; {formatDistance(race.distance)} {race.surface} &middot; {race.raceClass.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Post Time</p>
                  <CountdownTimer targetDate={race.postTime} size="lg" urgentThresholdHours={1} />
                  <p className="text-sm font-semibold text-gold-600 mt-1">{formatCurrency(race.purse)}</p>
                </div>
              </div>

              {/* Entries */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {race.entries.map((entry) => {
                  const result = race.results.find((r) => r.entryId === entry.id);
                  return (
                    <div key={entry.id} className="flex items-center justify-between px-6 py-3">
                      <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                          {entry.postPosition ?? '-'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {entry.horseName}
                          </p>
                          <p className="text-xs text-gray-500">
                            J: {entry.jockeyName || 'TBD'} &middot; {entry.weight ? `${entry.weight}lbs` : ''} &middot; ML: {entry.morningLineOdds || '--'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {entry.medications.length > 0 && (
                          <div className="flex gap-1">
                            {entry.medications.map((med) => (
                              <Badge key={med} color="yellow" size="sm">{med}</Badge>
                            ))}
                          </div>
                        )}
                        <StatusBadge status={entry.status} type="entry" size="sm" />
                        {result && (
                          <Badge
                            color={result.officialPosition === 1 ? 'gold' : result.officialPosition <= 3 ? 'green' : 'gray'}
                            size="sm"
                          >
                            #{result.officialPosition} {result.finalTime || ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
