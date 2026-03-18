import { useNavigate } from 'react-router-dom';
import { PageHeader, Card, CardTitle, Badge, EmptyState, LoadingSpinner } from '@/components/ui';
import { useHorses } from '@/api/horses';
import { useRaces } from '@/api/races';
import { useInvoices } from '@/api/financial';
import { useAuthStore } from '@/stores/auth';
import { formatCurrency, formatDate } from '@/lib/utils';
import { TrophyIcon, DocumentTextIcon, ChatBubbleLeftRightIcon, HandRaisedIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function OwnerDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: horsesData, isLoading: horsesLoading } = useHorses({ limit: 50 });
  const { data: racesData } = useRaces({ limit: 5, status: 'OFFICIAL' as never });
  const { data: invoicesData } = useInvoices({ limit: 5 });

  const horses = horsesData?.data ?? [];
  const recentRaces = racesData?.data ?? [];
  const invoices = invoicesData?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Owner Portal"
        subtitle={`Welcome, ${user?.firstName || 'Owner'}`}
      />

      {/* Quick links */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card hover onClick={() => navigate('/owner-portal/messages')} className="text-center">
          <ChatBubbleLeftRightIcon className="mx-auto h-8 w-8 text-brand-600" />
          <p className="mt-2 text-sm font-semibold">Messages</p>
        </Card>
        <Card hover onClick={() => navigate('/owner-portal/voting')} className="text-center">
          <HandRaisedIcon className="mx-auto h-8 w-8 text-brand-600" />
          <p className="mt-2 text-sm font-semibold">Voting</p>
        </Card>
        <Card hover onClick={() => navigate('/financial/invoices')} className="text-center">
          <DocumentTextIcon className="mx-auto h-8 w-8 text-brand-600" />
          <p className="mt-2 text-sm font-semibold">Invoices</p>
        </Card>
        <Card hover onClick={() => navigate('/races')} className="text-center">
          <TrophyIcon className="mx-auto h-8 w-8 text-brand-600" />
          <p className="mt-2 text-sm font-semibold">Races</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* My Horses */}
        <Card>
          <CardTitle className="mb-4">My Horses</CardTitle>
          {horsesLoading ? (
            <LoadingSpinner />
          ) : horses.length === 0 ? (
            <EmptyState message="No horses associated with your account" />
          ) : (
            <div className="space-y-3">
              {horses.map((horse) => (
                <Link
                  key={horse.id}
                  to={`/owner-portal/horses/${horse.id}`}
                  className="flex items-center gap-4 rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                >
                  <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                    {horse.imageUrl ? (
                      <img src={horse.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-bold text-gray-300">{horse.name[0]}</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{horse.name}</p>
                    <p className="text-xs text-gray-500">{horse.sex} &middot; {horse.breed.replace(/_/g, ' ')}</p>
                  </div>
                  <Badge color={horse.status === 'ACTIVE' ? 'green' : 'gray'} size="sm">{horse.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Results */}
        <Card>
          <CardTitle className="mb-4">Recent Results</CardTitle>
          {recentRaces.length === 0 ? (
            <EmptyState message="No recent race results" />
          ) : (
            <div className="space-y-3">
              {recentRaces.map((race) => (
                <div key={race.id} className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {race.trackName} R{race.raceNumber}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(race.raceDate)}</p>
                  {race.results.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      {race.results.slice(0, 3).map((r) => (
                        <Badge
                          key={r.id}
                          color={r.officialPosition === 1 ? 'gold' : r.officialPosition <= 3 ? 'green' : 'gray'}
                          size="sm"
                        >
                          #{r.officialPosition} {r.horseName}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pending Invoices */}
        <Card className="lg:col-span-2">
          <CardTitle className="mb-4">Recent Invoices</CardTitle>
          {invoices.length === 0 ? (
            <EmptyState message="No invoices" />
          ) : (
            <div className="space-y-2">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{inv.invoiceNumber}</p>
                    <p className="text-xs text-gray-500">Due {formatDate(inv.dueOn)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      color={inv.status === 'PAID' ? 'green' : inv.status === 'OVERDUE' ? 'red' : 'blue'}
                      size="sm"
                    >
                      {inv.status}
                    </Badge>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(inv.totalCents)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
