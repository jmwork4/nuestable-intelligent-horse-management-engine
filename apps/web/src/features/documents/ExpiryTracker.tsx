import { PageHeader, Card, Badge, LoadingSpinner, EmptyState } from '@/components/ui';
import { useExpiryTracker } from '@/api/documents';
import { DocumentCategory } from '@nuestable/shared';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  valid: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Valid' },
  expiring_soon: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Expiring' },
  expired: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Expired' },
  missing: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', label: 'Missing' },
};

const TRACKED_CATEGORIES: DocumentCategory[] = [
  DocumentCategory.COGGINS,
  DocumentCategory.HEALTH_CERTIFICATE,
  DocumentCategory.REGISTRATION,
  DocumentCategory.INSURANCE,
  DocumentCategory.LICENSE,
];

export default function ExpiryTracker() {
  const { data: trackerData = [], isLoading } = useExpiryTracker();

  return (
    <div>
      <PageHeader
        title="Document Expiry Tracker"
        subtitle="Monitor document status across all horses"
        breadcrumbs={[
          { label: 'Documents', href: '/documents' },
          { label: 'Expiry Tracker' },
        ]}
      />

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : trackerData.length === 0 ? (
        <EmptyState message="No horses to track" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Horse</th>
                {TRACKED_CATEGORIES.map((cat) => (
                  <th key={cat} className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    {cat.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {trackerData.map((horse) => (
                <tr key={horse.horseId}>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {horse.horseName}
                  </td>
                  {TRACKED_CATEGORIES.map((cat) => {
                    const doc = horse.documents.find((d) => d.category === cat);
                    const status = doc?.status ?? 'missing';
                    const config = statusColors[status] ?? statusColors.missing!;

                    return (
                      <td key={cat} className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                            config.bg,
                            config.text,
                          )}
                        >
                          {config.label}
                          {doc?.expiresAt && status !== 'missing' && (
                            <span className="ml-1 text-[10px] opacity-75">
                              {formatDate(doc.expiresAt, 'MM/DD')}
                            </span>
                          )}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
