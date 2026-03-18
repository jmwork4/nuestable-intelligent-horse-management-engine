import { useNavigate } from 'react-router-dom';
import { DataTable, type Column, Badge, EmptyState } from '@/components/ui';
import { useRaces } from '@/api/races';
import { formatDate, formatDistance, formatCurrency } from '@/lib/utils';
import type { Race } from '@nuestable/shared';

interface RaceHistoryTabProps {
  horseId: string;
}

export function RaceHistoryTab({ horseId }: RaceHistoryTabProps) {
  const navigate = useNavigate();
  // In a real app we'd have a horse-specific races endpoint
  const { data, isLoading } = useRaces({ limit: 50 });

  // Filter races that include this horse
  const races = (data?.data ?? []).filter((race) =>
    race.entries.some((e) => e.horseId === horseId),
  );

  const columns: Column<Race>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (race) => <span className="text-sm">{formatDate(race.raceDate)}</span>,
      accessor: (race) => new Date(race.raceDate).getTime(),
    },
    {
      key: 'track',
      header: 'Track',
      render: (race) => (
        <span className="text-sm font-medium">{race.trackName} R{race.raceNumber}</span>
      ),
    },
    {
      key: 'class',
      header: 'Class',
      render: (race) => (
        <Badge color="brand" size="sm">{race.raceClass.replace(/_/g, ' ')}</Badge>
      ),
    },
    {
      key: 'distance',
      header: 'Distance',
      render: (race) => <span className="text-sm">{formatDistance(race.distance)} {race.surface}</span>,
    },
    {
      key: 'finish',
      header: 'Finish',
      render: (race) => {
        const result = race.results.find((r) => r.horseId === horseId);
        if (!result) return <Badge color="gray" size="sm">--</Badge>;
        const pos = result.officialPosition;
        const color = pos === 1 ? 'gold' as const : pos <= 3 ? 'green' as const : 'gray' as const;
        return <Badge color={color} size="sm">{pos}{pos === 1 ? 'st' : pos === 2 ? 'nd' : pos === 3 ? 'rd' : 'th'}</Badge>;
      },
    },
    {
      key: 'earnings',
      header: 'Earnings',
      render: (race) => {
        const result = race.results.find((r) => r.horseId === horseId);
        return (
          <span className="text-sm font-medium text-green-600">
            {result ? formatCurrency(result.earnings) : '--'}
          </span>
        );
      },
    },
    {
      key: 'speed',
      header: 'Speed Fig',
      render: (race) => {
        const result = race.results.find((r) => r.horseId === horseId);
        return <span className="text-sm font-mono">{result?.speedFigure ?? '--'}</span>;
      },
    },
  ];

  if (!isLoading && races.length === 0) {
    return <EmptyState message="No race history for this horse" />;
  }

  return (
    <DataTable
      columns={columns}
      data={races}
      loading={isLoading}
      onRowClick={(race) => navigate(`/races/${race.id}`)}
      rowKey={(race) => race.id}
      emptyMessage="No race history"
    />
  );
}
