import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import type {
  Notification,
  NotificationPreference,
  NotificationCategory,
  UpdateNotificationPreferenceInput,
} from '@nuestable/shared';

interface NotificationParams {
  page?: number;
  limit?: number;
  category?: NotificationCategory;
  unreadOnly?: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function fetchNotifications(params: NotificationParams): Promise<PaginatedResponse<Notification>> {
  const { data } = await apiClient.get('/notifications', { params });
  return data;
}

async function fetchUnreadCount(): Promise<{ count: number }> {
  const { data } = await apiClient.get('/notifications/unread-count');
  return data;
}

async function markAsRead(id: string): Promise<void> {
  await apiClient.post(`/notifications/${id}/read`);
}

async function markAllAsRead(): Promise<void> {
  await apiClient.post('/notifications/read-all');
}

async function fetchPreferences(): Promise<NotificationPreference[]> {
  const { data } = await apiClient.get('/notifications/preferences');
  return data;
}

async function updatePreference(input: UpdateNotificationPreferenceInput): Promise<NotificationPreference> {
  const { data } = await apiClient.put('/notifications/preferences', input);
  return data;
}

export function useNotifications(params: NotificationParams = {}) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => fetchNotifications(params),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: fetchUnreadCount,
    refetchInterval: 30_000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: fetchPreferences,
  });
}

export function useUpdateNotificationPreference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePreference,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
    },
  });
}
