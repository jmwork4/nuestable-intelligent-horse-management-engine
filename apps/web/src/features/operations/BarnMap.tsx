import { PageHeader, Card, CardTitle, Badge, LoadingSpinner, EmptyState } from '@/components/ui';
import { useBarns } from '@/api/operations';
import { cn } from '@/lib/utils';
import type { Stall } from '@nuestable/shared';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';

const stallStatusColors: Record<string, string> = {
  OCCUPIED: 'bg-brand-100 border-brand-300 dark:bg-brand-900/20 dark:border-brand-700',
  VACANT: 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700',
  MAINTENANCE: 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700',
  RESERVED: 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700',
};

export default function BarnMap() {
  const { data: barns = [], isLoading } = useBarns();

  return (
    <div>
      <PageHeader
        title="Barn Map"
        subtitle="Stall assignments and status"
        breadcrumbs={[
          { label: 'Operations', href: '/operations/checklist' },
          { label: 'Barn Map' },
        ]}
      />

      {/* Legend */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border-2 border-brand-300 bg-brand-100" />
            <span className="text-xs text-gray-600">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border-2 border-gray-200 bg-gray-50" />
            <span className="text-xs text-gray-600">Vacant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border-2 border-yellow-300 bg-yellow-50" />
            <span className="text-xs text-gray-600">Maintenance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border-2 border-blue-300 bg-blue-50" />
            <span className="text-xs text-gray-600">Reserved</span>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : barns.length === 0 ? (
        <EmptyState
          icon={<BuildingOffice2Icon className="mx-auto h-12 w-12" />}
          title="No barns configured"
          message="Set up your barn layout to track stall assignments"
        />
      ) : (
        <div className="space-y-8">
          {barns.map((barn) => (
            <Card key={barn.id}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle>{barn.name}</CardTitle>
                  {barn.location && (
                    <p className="text-sm text-gray-500 mt-1">{barn.location}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge color="brand" size="sm">
                    {barn.stalls.filter((s) => s.status === 'OCCUPIED').length}/{barn.capacity} occupied
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {barn.stalls.map((stall) => (
                  <StallCard key={stall.id} stall={stall} />
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StallCard({ stall }: { stall: Stall }) {
  return (
    <div
      className={cn(
        'rounded-lg border-2 p-3 transition-colors cursor-pointer hover:shadow-md',
        stallStatusColors[stall.status] ?? stallStatusColors.VACANT,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">#{stall.number}</span>
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            stall.status === 'OCCUPIED' ? 'bg-brand-500' :
            stall.status === 'MAINTENANCE' ? 'bg-yellow-500' :
            stall.status === 'RESERVED' ? 'bg-blue-500' : 'bg-gray-300',
          )}
        />
      </div>
      {stall.horseName ? (
        <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
          {stall.horseName}
        </p>
      ) : (
        <p className="mt-1 text-xs text-gray-400 italic">
          {stall.status === 'MAINTENANCE' ? 'Under maintenance' : stall.status === 'RESERVED' ? 'Reserved' : 'Empty'}
        </p>
      )}
      {stall.notes && (
        <p className="mt-1 text-[10px] text-gray-400 truncate">{stall.notes}</p>
      )}
    </div>
  );
}
