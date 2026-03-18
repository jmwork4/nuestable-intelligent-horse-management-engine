import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, Card, Badge, Button, Select, EmptyState, LoadingSpinner } from '@/components/ui';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/api/notifications';
import { formatDateTime, timeFromNow, cn } from '@/lib/utils';
import { NotificationCategory, NotificationPriority } from '@nuestable/shared';
import type { Notification } from '@nuestable/shared';
import { BellIcon, CheckIcon, FunnelIcon } from '@heroicons/react/24/outline';
import {
  ShieldExclamationIcon,
  DocumentTextIcon,
  TrophyIcon,
  BanknotesIcon,
  ClipboardDocumentCheckIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

const categoryIcons: Record<string, React.ReactNode> = {
  WITHDRAWAL_ALERT: <ShieldExclamationIcon className="h-5 w-5 text-red-500" />,
  DOCUMENT_EXPIRY: <DocumentTextIcon className="h-5 w-5 text-yellow-500" />,
  RACE_RESULT: <TrophyIcon className="h-5 w-5 text-gold-500" />,
  RACE_ENTRY_CONFIRMATION: <TrophyIcon className="h-5 w-5 text-blue-500" />,
  RACE_SCRATCH: <TrophyIcon className="h-5 w-5 text-red-500" />,
  INVOICE_ISSUED: <BanknotesIcon className="h-5 w-5 text-green-500" />,
  PAYMENT_RECEIVED: <BanknotesIcon className="h-5 w-5 text-green-500" />,
  TASK_ASSIGNED: <ClipboardDocumentCheckIcon className="h-5 w-5 text-blue-500" />,
  TASK_OVERDUE: <ClipboardDocumentCheckIcon className="h-5 w-5 text-red-500" />,
  HEALTH_REMINDER: <HeartIcon className="h-5 w-5 text-pink-500" />,
  VACCINATION_DUE: <HeartIcon className="h-5 w-5 text-yellow-500" />,
  EMERGENCY_VET: <HeartIcon className="h-5 w-5 text-red-500" />,
};

const priorityColors: Record<string, 'gray' | 'blue' | 'yellow' | 'red'> = {
  LOW: 'gray',
  NORMAL: 'blue',
  HIGH: 'yellow',
  CRITICAL: 'red',
};

export default function NotificationCenter() {
  const [categoryFilter, setCategoryFilter] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useNotifications({
    page,
    limit: 20,
    category: (categoryFilter || undefined) as NotificationCategory | undefined,
    unreadOnly: unreadOnly || undefined,
  });

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = data?.data ?? [];

  const categoryOptions = [
    { label: 'All Categories', value: '' },
    ...Object.values(NotificationCategory).map((c) => ({ label: c.replace(/_/g, ' '), value: c })),
  ];

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${data?.total ?? 0} notifications`}
        actions={
          <div className="flex gap-3">
            <Link to="/notifications/preferences">
              <Button variant="secondary" size="sm">Preferences</Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              icon={<CheckIcon className="h-4 w-4" />}
              onClick={() => markAllAsRead.mutate()}
              loading={markAllAsRead.isPending}
            >
              Mark all read
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          options={categoryOptions}
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="w-48"
        />
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => { setUnreadOnly(e.target.checked); setPage(1); }}
            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-gray-600 dark:text-gray-400">Unread only</span>
        </label>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<BellIcon className="mx-auto h-12 w-12" />}
          title="No notifications"
          message="You're all caught up!"
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={() => markAsRead.mutate(notification.id)}
            />
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm text-gray-500">
            Page {page} of {data.totalPages}
          </span>
          <Button variant="secondary" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= data.totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: () => void;
}) {
  const isUnread = !notification.readAt;
  const icon = categoryIcons[notification.category] || <BellIcon className="h-5 w-5 text-gray-400" />;

  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-lg border p-4 transition-colors',
        isUnread
          ? 'border-brand-200 bg-brand-50/50 dark:border-brand-900/30 dark:bg-brand-900/10'
          : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900',
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={cn('text-sm', isUnread ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300')}>
              {notification.title}
            </p>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{notification.body}</p>
          </div>
          <Badge color={priorityColors[notification.priority] ?? 'gray'} size="sm">
            {notification.priority}
          </Badge>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-xs text-gray-400">{timeFromNow(notification.createdAt)}</span>
          <Badge color="gray" size="sm">{notification.category.replace(/_/g, ' ')}</Badge>
          {isUnread && (
            <button
              onClick={onMarkRead}
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              Mark as read
            </button>
          )}
        </div>
      </div>
      {isUnread && <span className="mt-2 h-2 w-2 rounded-full bg-brand-500 flex-shrink-0" />}
    </div>
  );
}
