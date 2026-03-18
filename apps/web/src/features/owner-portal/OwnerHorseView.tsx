import { useParams } from 'react-router-dom';
import { PageHeader, Card, CardTitle, Badge, StatusBadge, LoadingSpinner, EmptyState } from '@/components/ui';
import { useHorse } from '@/api/horses';
import { formatDate, calculateAge, formatCurrency } from '@/lib/utils';

export default function OwnerHorseView() {
  const { id } = useParams<{ id: string }>();
  const { data: horse, isLoading } = useHorse(id);

  if (isLoading) {
    return <div className="flex justify-center py-32"><LoadingSpinner size="lg" /></div>;
  }

  if (!horse) {
    return <div className="py-32 text-center text-gray-500">Horse not found</div>;
  }

  const age = calculateAge(horse.foalDate);

  return (
    <div>
      <PageHeader
        title={horse.name}
        subtitle={horse.registeredName || undefined}
        breadcrumbs={[
          { label: 'Owner Portal', href: '/owner-portal' },
          { label: horse.name },
        ]}
        actions={<StatusBadge status={horse.status} type="horse" size="lg" />}
      />

      {/* Hero */}
      {horse.imageUrl && (
        <div className="mb-6 h-64 w-full overflow-hidden rounded-xl">
          <img src={horse.imageUrl} alt={horse.name} className="h-full w-full object-cover" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-4">Details</CardTitle>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">Sex</dt>
              <dd className="mt-1 text-sm font-semibold">{horse.sex}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">Breed</dt>
              <dd className="mt-1 text-sm font-semibold">{horse.breed.replace(/_/g, ' ')}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">Age</dt>
              <dd className="mt-1 text-sm font-semibold">{age ? `${age} years` : '--'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">Color</dt>
              <dd className="mt-1 text-sm font-semibold">{horse.color || '--'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">Foal Date</dt>
              <dd className="mt-1 text-sm font-semibold">{formatDate(horse.foalDate)}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardTitle className="mb-4">Pedigree</CardTitle>
          {horse.pedigree ? (
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase">Sire</dt>
                <dd className="mt-1 text-sm font-semibold">{horse.pedigree.sire || '--'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase">Dam</dt>
                <dd className="mt-1 text-sm font-semibold">{horse.pedigree.dam || '--'}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-gray-500">No pedigree information available</p>
          )}
        </Card>

        <Card>
          <CardTitle className="mb-4">Ownership</CardTitle>
          {horse.ownershipShares.length > 0 ? (
            <div className="space-y-3">
              {horse.ownershipShares.map((share) => (
                <div key={share.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{share.ownerName}</span>
                  <Badge color="brand" size="sm">{share.percentage}%</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No ownership information</p>
          )}
        </Card>

        {horse.surfacePreferences.length > 0 && (
          <Card>
            <CardTitle className="mb-4">Surface Preferences</CardTitle>
            <div className="flex gap-2">
              {horse.surfacePreferences.map((s) => (
                <Badge key={s} color="brand">{s.replace(/_/g, ' ')}</Badge>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
