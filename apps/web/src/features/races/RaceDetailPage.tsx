import { useParams } from 'react-router-dom';
import { PageHeader, Card, CardTitle, DataTable, type Column, StatusBadge, Badge, CountdownTimer, LoadingSpinner } from '@/components/ui';
import { useRace } from '@/api/races';
import { formatDate, formatDateTime, formatDistance, formatCurrency } from '@/lib/utils';
import type { RaceEntry, RaceResult } from '@nuestable/shared';

export default function RaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: race, isLoading } = useRace(id);

  if (isLoading) {
    return <div className="flex justify-center py-32"><LoadingSpinner size="lg" /></div>;
  }

  if (!race) {
    return <div className="py-32 text-center text-gray-500">Race not found</div>;
  }

  const entryColumns: Column<RaceEntry>[] = [
    {
      key: 'pp',
      header: 'PP',
      width: '60px',
      render: (e) => (
        <span className="font-bold text-brand-600">{e.postPosition ?? '--'}</span>
      ),
    },
    {
      key: 'horse',
      header: 'Horse',
      render: (e) => <span className="font-semibold">{e.horseName}</span>,
    },
    {
      key: 'jockey',
      header: 'Jockey',
      render: (e) => <span>{e.jockeyName || 'TBD'}</span>,
    },
    {
      key: 'weight',
      header: 'Wt',
      render: (e) => <span>{e.weight ?? '--'}</span>,
    },
    {
      key: 'ml',
      header: 'ML',
      render: (e) => <span className="font-mono">{e.morningLineOdds || '--'}</span>,
    },
    {
      key: 'meds',
      header: 'Meds',
      render: (e) => (
        <div className="flex gap-1">
          {e.medications.map((m) => <Badge key={m} color="yellow" size="sm">{m}</Badge>)}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (e) => <StatusBadge status={e.status} type="entry" size="sm" />,
    },
  ];

  const resultColumns: Column<RaceResult>[] = [
    {
      key: 'pos',
      header: 'Pos',
      width: '60px',
      render: (r) => {
        const color = r.officialPosition === 1 ? 'gold' as const : r.officialPosition <= 3 ? 'green' as const : 'gray' as const;
        return <Badge color={color} size="sm">{r.officialPosition}</Badge>;
      },
    },
    { key: 'horse', header: 'Horse', render: (r) => <span className="font-semibold">{r.horseName}</span> },
    { key: 'margin', header: 'Margin', render: (r) => <span>{r.margin || '--'}</span> },
    { key: 'time', header: 'Time', render: (r) => <span className="font-mono">{r.finalTime || '--'}</span> },
    { key: 'speed', header: 'Speed Fig', render: (r) => <span className="font-mono">{r.speedFigure ?? '--'}</span> },
    {
      key: 'earnings',
      header: 'Earnings',
      render: (r) => <span className="text-green-600 font-medium">{formatCurrency(r.earnings)}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title={`${race.trackName} - Race ${race.raceNumber}`}
        breadcrumbs={[
          { label: 'Races', href: '/races' },
          { label: `Race ${race.raceNumber}` },
        ]}
        actions={<StatusBadge status={race.status} type="race" size="lg" />}
      />

      {/* Race info */}
      <div className="grid grid-cols-1 gap-6 mb-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs font-medium text-gray-500 uppercase">Date</p>
          <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">{formatDate(race.raceDate)}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-gray-500 uppercase">Post Time</p>
          <div className="mt-1">
            {race.postTime ? (
              <CountdownTimer targetDate={race.postTime} size="lg" />
            ) : (
              <p className="text-lg font-bold text-gray-400">TBD</p>
            )}
          </div>
        </Card>
        <Card>
          <p className="text-xs font-medium text-gray-500 uppercase">Distance / Surface</p>
          <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
            {formatDistance(race.distance)} {race.surface}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-gray-500 uppercase">Purse</p>
          <p className="mt-1 text-lg font-bold text-gold-600">{formatCurrency(race.purse)}</p>
        </Card>
      </div>

      {/* Conditions */}
      <Card className="mb-6">
        <CardTitle className="mb-3">Conditions</CardTitle>
        <p className="text-sm text-gray-700 dark:text-gray-300">{race.conditions.conditionText}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge color="brand">{race.raceClass.replace(/_/g, ' ')}</Badge>
          <Badge color="gray">{race.raceType}</Badge>
          {race.conditions.sexRestriction && <Badge color="purple">{race.conditions.sexRestriction}</Badge>}
          {race.conditions.statesBred && <Badge color="blue">States Bred</Badge>}
        </div>
      </Card>

      {/* Entries */}
      <Card className="mb-6">
        <CardTitle className="mb-3">Entries ({race.entries.length})</CardTitle>
        <DataTable
          columns={entryColumns}
          data={race.entries}
          rowKey={(e) => e.id}
          emptyMessage="No entries"
        />
      </Card>

      {/* Results */}
      {race.results.length > 0 && (
        <Card>
          <CardTitle className="mb-3">Results</CardTitle>
          <DataTable
            columns={resultColumns}
            data={race.results.sort((a, b) => a.officialPosition - b.officialPosition)}
            rowKey={(r) => r.id}
          />
        </Card>
      )}
    </div>
  );
}
