import { PageHeader, Card, CardTitle, Badge, Button, LoadingSpinner, EmptyState } from '@/components/ui';
import { useNotificationPreferences, useUpdateNotificationPreference } from '@/api/notifications';
import { useAuthStore } from '@/stores/auth';
import { toast } from '@/components/ui/Toast';
import {
  NotificationCategory,
  NotificationChannel,
  MANDATORY_NOTIFICATION_CATEGORIES,
} from '@nuestable/shared';
import { cn } from '@/lib/utils';

const CHANNELS: NotificationChannel[] = [
  NotificationChannel.IN_APP,
  NotificationChannel.EMAIL,
  NotificationChannel.SMS,
  NotificationChannel.PUSH,
];

const CATEGORY_GROUPS: { label: string; categories: NotificationCategory[] }[] = [
  {
    label: 'Mandatory Alerts',
    categories: [
      NotificationCategory.WITHDRAWAL_ALERT,
      NotificationCategory.DOCUMENT_EXPIRY,
      NotificationCategory.REGULATORY_DEADLINE,
      NotificationCategory.RACE_SCRATCH,
      NotificationCategory.EMERGENCY_VET,
    ],
  },
  {
    label: 'Race Notifications',
    categories: [
      NotificationCategory.RACE_ENTRY_CONFIRMATION,
      NotificationCategory.RACE_RESULT,
    ],
  },
  {
    label: 'Financial',
    categories: [
      NotificationCategory.INVOICE_ISSUED,
      NotificationCategory.PAYMENT_RECEIVED,
    ],
  },
  {
    label: 'Operations',
    categories: [
      NotificationCategory.TASK_ASSIGNED,
      NotificationCategory.TASK_OVERDUE,
    ],
  },
  {
    label: 'Health',
    categories: [
      NotificationCategory.HEALTH_REMINDER,
      NotificationCategory.VACCINATION_DUE,
    ],
  },
  {
    label: 'Other',
    categories: [NotificationCategory.GENERAL],
  },
];

export default function NotificationPreferences() {
  const { user } = useAuthStore();
  const { data: preferences = [], isLoading } = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreference();

  const toggleChannel = (category: NotificationCategory, channel: NotificationChannel) => {
    const pref = preferences.find((p) => p.category === category);
    const currentChannels = pref?.channels ?? [NotificationChannel.IN_APP, NotificationChannel.EMAIL];

    const newChannels = currentChannels.includes(channel)
      ? currentChannels.filter((c) => c !== channel)
      : [...currentChannels, channel];

    updateMutation.mutate(
      {
        userId: user?.id ?? '',
        organizationId: user?.organizationId ?? '',
        category,
        channels: newChannels,
        enabled: newChannels.length > 0,
      },
      {
        onSuccess: () => toast.success('Preference updated'),
        onError: () => toast.error('Failed to update preference'),
      },
    );
  };

  const isMandatory = (category: NotificationCategory) =>
    (MANDATORY_NOTIFICATION_CATEGORIES as readonly NotificationCategory[]).includes(category);

  return (
    <div>
      <PageHeader
        title="Notification Preferences"
        subtitle="Configure how you receive notifications"
        breadcrumbs={[
          { label: 'Notifications', href: '/notifications' },
          { label: 'Preferences' },
        ]}
      />

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="space-y-6">
          {CATEGORY_GROUPS.map((group) => (
            <Card key={group.label}>
              <CardTitle className="mb-4">{group.label}</CardTitle>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase">Alert Type</th>
                      {CHANNELS.map((ch) => (
                        <th key={ch} className="pb-3 text-center text-xs font-semibold text-gray-500 uppercase w-24">
                          {ch.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {group.categories.map((cat) => {
                      const pref = preferences.find((p) => p.category === cat);
                      const activeChannels = pref?.channels ?? [NotificationChannel.IN_APP, NotificationChannel.EMAIL];
                      const mandatory = isMandatory(cat);

                      return (
                        <tr key={cat}>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-900 dark:text-gray-100">
                                {cat.replace(/_/g, ' ')}
                              </span>
                              {mandatory && (
                                <Badge color="red" size="sm">Required</Badge>
                              )}
                            </div>
                          </td>
                          {CHANNELS.map((ch) => {
                            const isActive = activeChannels.includes(ch);
                            const isDisabled = mandatory;

                            return (
                              <td key={ch} className="py-3 text-center">
                                <button
                                  onClick={() => !isDisabled && toggleChannel(cat, ch)}
                                  disabled={isDisabled}
                                  className={cn(
                                    'inline-flex h-6 w-11 items-center rounded-full transition-colors min-h-0',
                                    isActive ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700',
                                    isDisabled && 'opacity-50 cursor-not-allowed',
                                  )}
                                >
                                  <span
                                    className={cn(
                                      'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                                      isActive ? 'translate-x-6' : 'translate-x-1',
                                    )}
                                  />
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
