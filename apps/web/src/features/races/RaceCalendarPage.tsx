import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { PageHeader, Button, Card, Badge, StatusBadge, Select, EmptyState, LoadingSpinner } from '@/components/ui';
import { useRaces } from '@/api/races';
import { formatDistance, formatCurrency, cn } from '@/lib/utils';

export default function RaceCalendarPage() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [surfaceFilter, setSurfaceFilter] = useState('');
  const [trackFilter, setTrackFilter] = useState('');

  const dateFrom = currentMonth.startOf('month').format('YYYY-MM-DD');
  const dateTo = currentMonth.endOf('month').format('YYYY-MM-DD');

  const { data, isLoading } = useRaces({
    dateFrom,
    dateTo,
    surface: surfaceFilter || undefined,
    trackName: trackFilter || undefined,
    limit: 100,
  });

  const races = data?.data ?? [];

  // Group races by date
  const racesByDate = useMemo(() => {
    const map: Record<string, typeof races> = {};
    races.forEach((race) => {
      const key = dayjs(race.raceDate).format('YYYY-MM-DD');
      if (!map[key]) map[key] = [];
      map[key]!.push(race);
    });
    return map;
  }, [races]);

  // Build calendar grid
  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfWeek = currentMonth.startOf('month').day();
  const calendarDays: (number | null)[] = [];

  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const surfaceOptions = [
    { label: 'All Surfaces', value: '' },
    { label: 'Dirt', value: 'DIRT' },
    { label: 'Turf', value: 'TURF' },
    { label: 'Synthetic', value: 'SYNTHETIC' },
    { label: 'All Weather', value: 'ALL_WEATHER' },
  ];

  return (
    <div>
      <PageHeader
        title="Race Calendar"
        subtitle="Upcoming races and entries"
        actions={
          <Button variant="secondary" onClick={() => navigate('/races/today')}>
            Today&apos;s Races
          </Button>
        }
      />

      {/* Filters & month navigation */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronLeftIcon className="h-4 w-4" />}
            onClick={() => setCurrentMonth((m) => m.subtract(1, 'month'))}
          >
            Prev
          </Button>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 min-w-[160px] text-center">
            {currentMonth.format('MMMM YYYY')}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronRightIcon className="h-4 w-4" />}
            onClick={() => setCurrentMonth((m) => m.add(1, 'month'))}
          >
            Next
          </Button>
        </div>
        <div className="flex gap-3">
          <Select options={surfaceOptions} value={surfaceFilter} onChange={(e) => setSurfaceFilter(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const dateStr = day ? currentMonth.date(day).format('YYYY-MM-DD') : null;
              const dayRaces = dateStr ? racesByDate[dateStr] ?? [] : [];
              const isToday = day && currentMonth.date(day).isSame(dayjs(), 'day');

              return (
                <div
                  key={idx}
                  className={cn(
                    'min-h-[100px] border-b border-r border-gray-100 p-2 dark:border-gray-800',
                    !day && 'bg-gray-50 dark:bg-gray-900/50',
                  )}
                >
                  {day && (
                    <>
                      <span
                        className={cn(
                          'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm',
                          isToday
                            ? 'bg-brand-600 text-white font-bold'
                            : 'text-gray-700 dark:text-gray-300',
                        )}
                      >
                        {day}
                      </span>
                      <div className="mt-1 space-y-1">
                        {dayRaces.slice(0, 3).map((race) => (
                          <button
                            key={race.id}
                            onClick={() => navigate(`/races/${race.id}`)}
                            className="block w-full truncate rounded bg-brand-50 px-1.5 py-0.5 text-left text-[10px] font-medium text-brand-700 hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-400"
                          >
                            {race.trackName} R{race.raceNumber}
                          </button>
                        ))}
                        {dayRaces.length > 3 && (
                          <span className="text-[10px] text-gray-400">+{dayRaces.length - 3} more</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List view below calendar */}
      {races.length > 0 && (
        <div className="mt-8 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            All Races This Month ({races.length})
          </h3>
          {races.map((race) => (
            <Card
              key={race.id}
              hover
              onClick={() => navigate(`/races/${race.id}`)}
              padding="sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {race.trackName} - Race {race.raceNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    {dayjs(race.raceDate).format('ddd, MMM D')} &middot; {formatDistance(race.distance)} &middot; {race.surface} &middot; {race.raceClass.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={race.status} type="race" size="sm" />
                  <p className="text-sm font-medium text-gold-600 mt-1">{formatCurrency(race.purse)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
