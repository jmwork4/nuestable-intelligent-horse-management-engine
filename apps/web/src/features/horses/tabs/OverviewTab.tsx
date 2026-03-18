import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardTitle, Badge } from '@/components/ui';
import { formatDate, calculateAge, formatCurrency } from '@/lib/utils';
import type { Horse } from '@nuestable/shared';

const OWNERSHIP_COLORS = ['#1B4332', '#D4A843', '#2D7A50', '#4AB87F', '#6EC596', '#9AD6B5'];

interface OverviewTabProps {
  horse: Horse;
}

export function OverviewTab({ horse }: OverviewTabProps) {
  const age = calculateAge(horse.foalDate);

  const ownershipData = horse.ownershipShares.map((share) => ({
    name: share.ownerName,
    value: share.percentage,
  }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Quick stats */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardTitle className="mb-4">Details</CardTitle>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sex</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{horse.sex}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Breed</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{horse.breed.replace(/_/g, ' ')}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Age</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {age !== null ? `${age} years` : '--'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Color</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{horse.color || '--'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Foal Date</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{formatDate(horse.foalDate)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Claim Price</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {horse.claimPrice ? formatCurrency(horse.claimPrice) : '--'}
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardTitle className="mb-4">Identification</CardTitle>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registered Name</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{horse.registeredName || '--'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tattoo #</dt>
              <dd className="mt-1 text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">{horse.tattooNumber || '--'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Chip #</dt>
              <dd className="mt-1 text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">{horse.chipNumber || '--'}</dd>
            </div>
          </dl>
        </Card>

        {horse.pedigree && (
          <Card>
            <CardTitle className="mb-4">Pedigree</CardTitle>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sire</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{horse.pedigree.sire || '--'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dam</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{horse.pedigree.dam || '--'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sire of Dam</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{horse.pedigree.sireOfDam || '--'}</dd>
              </div>
            </dl>
          </Card>
        )}

        {horse.surfacePreferences.length > 0 && (
          <Card>
            <CardTitle className="mb-4">Surface Preferences</CardTitle>
            <div className="flex gap-2">
              {horse.surfacePreferences.map((surface) => (
                <Badge key={surface} color="brand">{surface.replace(/_/g, ' ')}</Badge>
              ))}
            </div>
          </Card>
        )}

        {horse.notes && (
          <Card>
            <CardTitle className="mb-4">Notes</CardTitle>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{horse.notes}</p>
          </Card>
        )}
      </div>

      {/* Ownership sidebar */}
      <div className="space-y-6">
        <Card>
          <CardTitle className="mb-4">Ownership</CardTitle>
          {ownershipData.length > 0 ? (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ownershipData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {ownershipData.map((_, idx) => (
                        <Cell key={idx} fill={OWNERSHIP_COLORS[idx % OWNERSHIP_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {horse.ownershipShares.map((share, idx) => (
                  <div key={share.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: OWNERSHIP_COLORS[idx % OWNERSHIP_COLORS.length] }}
                      />
                      <span className="text-gray-700 dark:text-gray-300">{share.ownerName}</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{share.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No ownership shares recorded</p>
          )}
        </Card>
      </div>
    </div>
  );
}
