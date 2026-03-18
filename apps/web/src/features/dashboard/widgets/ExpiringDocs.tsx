import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, Badge, EmptyState } from '@/components/ui';
import { useDocuments } from '@/api/documents';
import { formatDate } from '@/lib/utils';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

export function ExpiringDocs() {
  const { data, isLoading } = useDocuments({ expiringWithinDays: 30, limit: 5 });

  const docs = data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expiring Documents</CardTitle>
        <Link to="/documents/expiry" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          View all
        </Link>
      </CardHeader>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : docs.length === 0 ? (
        <EmptyState
          icon={<DocumentTextIcon className="mx-auto h-8 w-8" />}
          message="No documents expiring soon"
        />
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => {
            const daysUntil = doc.expiresAt ? dayjs(doc.expiresAt).diff(dayjs(), 'day') : null;
            const isUrgent = daysUntil !== null && daysUntil <= 7;
            const isWarning = daysUntil !== null && daysUntil <= 14;

            return (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {doc.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {doc.horseName || 'General'} &middot; {doc.category.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-3">
                  <Badge
                    color={isUrgent ? 'red' : isWarning ? 'yellow' : 'gray'}
                    size="sm"
                  >
                    {daysUntil !== null
                      ? daysUntil <= 0
                        ? 'Expired'
                        : `${daysUntil}d left`
                      : 'No expiry'}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
