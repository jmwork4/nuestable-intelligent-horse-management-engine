import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { PageHeader, Button, Card, StatusBadge, Input, Select, EmptyState, LoadingSpinner } from '@/components/ui';
import { useHorses } from '@/api/horses';
import { calculateAge, cn } from '@/lib/utils';
import { HorseStatus } from '@nuestable/shared';

export default function HorseListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useHorses({
    page,
    limit: 24,
    search: search || undefined,
    status: (statusFilter || undefined) as HorseStatus | undefined,
  });

  const horses = data?.data ?? [];

  const statusOptions = [
    { label: 'All Status', value: '' },
    ...Object.values(HorseStatus).map((s) => ({ label: s.replace(/_/g, ' '), value: s })),
  ];

  return (
    <div>
      <PageHeader
        title="Horses"
        subtitle={`${data?.total ?? 0} horses in your stable`}
        actions={
          <Button icon={<PlusIcon className="h-5 w-5" />} onClick={() => navigate('/horses/new')}>
            Add Horse
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-xs">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search horses..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 min-h-touch"
            />
          </div>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-40"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1 dark:border-gray-700">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'rounded-md p-2 transition-colors',
              viewMode === 'grid' ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-100',
            )}
          >
            <Squares2X2Icon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'rounded-md p-2 transition-colors',
              viewMode === 'list' ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-100',
            )}
          >
            <ListBulletIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : horses.length === 0 ? (
        <EmptyState
          title="No horses found"
          message={search ? 'Try adjusting your search or filters' : 'Add your first horse to get started'}
          action={
            !search
              ? { label: 'Add Horse', onClick: () => navigate('/horses/new') }
              : undefined
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {horses.map((horse) => (
            <Card
              key={horse.id}
              hover
              onClick={() => navigate(`/horses/${horse.id}`)}
              padding="none"
              className="overflow-hidden"
            >
              <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800">
                {horse.imageUrl ? (
                  <img src={horse.imageUrl} alt={horse.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl font-bold text-gray-300 dark:text-gray-600">
                    {horse.name[0]}
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{horse.name}</h3>
                  <StatusBadge status={horse.status} type="horse" size="sm" />
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {horse.sex} &middot; {horse.breed.replace(/_/g, ' ')}
                </p>
                {horse.ownerNames.length > 0 && (
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 truncate">
                    {horse.ownerNames.join(', ')}
                  </p>
                )}
                {horse.nextRaceName && (
                  <p className="mt-2 text-xs text-brand-600 dark:text-brand-400 font-medium">
                    Next: {horse.nextRaceName}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {horses.map((horse) => (
            <Card
              key={horse.id}
              hover
              onClick={() => navigate(`/horses/${horse.id}`)}
              padding="sm"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  {horse.imageUrl ? (
                    <img src={horse.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-lg font-bold text-gray-300">
                      {horse.name[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{horse.name}</p>
                  <p className="text-sm text-gray-500">
                    {horse.sex} &middot; {horse.breed.replace(/_/g, ' ')}
                  </p>
                </div>
                <StatusBadge status={horse.status} type="horse" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm text-gray-500">
            Page {page} of {data.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
