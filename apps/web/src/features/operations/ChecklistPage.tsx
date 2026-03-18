import { useState } from 'react';
import dayjs from 'dayjs';
import { PageHeader, Card, CardTitle, Button, LoadingSpinner, EmptyState } from '@/components/ui';
import { useChecklists, useCompleteChecklistItem, useChecklistTemplates } from '@/api/operations';
import { cn } from '@/lib/utils';
import { CheckIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

export default function ChecklistPage() {
  const [date] = useState(dayjs().format('YYYY-MM-DD'));
  const { data: checklists = [], isLoading } = useChecklists(date);
  const { data: templates = [] } = useChecklistTemplates();
  const completeMutation = useCompleteChecklistItem();

  const handleToggle = (instanceId: string, itemId: string) => {
    completeMutation.mutate({ instanceId, itemId });
  };

  // Calculate overall progress
  const totalItems = checklists.reduce(
    (sum, cl) => {
      const tmpl = templates.find((t) => t.id === cl.templateId);
      return sum + (tmpl?.items.length ?? 0);
    },
    0,
  );
  const completedItems = checklists.reduce((sum, cl) => sum + cl.completedItems.length, 0);
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Daily Checklist"
        subtitle={dayjs(date).format('dddd, MMMM D, YYYY')}
        breadcrumbs={[
          { label: 'Operations', href: '/operations/checklist' },
          { label: 'Checklist' },
        ]}
      />

      {/* Progress bar */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Today&apos;s Progress
          </p>
          <p className="text-sm font-bold text-brand-600">
            {completedItems}/{totalItems} ({progress}%)
          </p>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : checklists.length === 0 ? (
        <EmptyState
          icon={<ClipboardDocumentListIcon className="mx-auto h-12 w-12" />}
          title="No checklists for today"
          message="Create checklist templates to start tracking daily tasks"
        />
      ) : (
        <div className="space-y-6">
          {checklists.map((instance) => {
            const template = templates.find((t) => t.id === instance.templateId);
            if (!template) return null;

            return (
              <Card key={instance.id}>
                <CardTitle className="mb-4">{template.name}</CardTitle>
                <div className="space-y-2">
                  {template.items
                    .sort((a, b) => a.order - b.order)
                    .map((item) => {
                      const isCompleted = instance.completedItems.some((ci) => ci.itemId === item.id);

                      return (
                        <button
                          key={item.id}
                          onClick={() => !isCompleted && handleToggle(instance.id, item.id)}
                          disabled={isCompleted || completeMutation.isPending}
                          className={cn(
                            'flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors min-h-touch',
                            isCompleted
                              ? 'border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10'
                              : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800',
                          )}
                        >
                          <div
                            className={cn(
                              'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border-2 transition-colors',
                              isCompleted
                                ? 'border-green-500 bg-green-500 text-white'
                                : 'border-gray-300 dark:border-gray-600',
                            )}
                          >
                            {isCompleted && <CheckIcon className="h-5 w-5" />}
                          </div>
                          <div className="flex-1">
                            <p
                              className={cn(
                                'text-sm font-medium',
                                isCompleted
                                  ? 'text-green-700 line-through dark:text-green-400'
                                  : 'text-gray-900 dark:text-gray-100',
                              )}
                            >
                              {item.label}
                            </p>
                          </div>
                          {item.required && !isCompleted && (
                            <span className="text-xs font-medium text-red-500">Required</span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
