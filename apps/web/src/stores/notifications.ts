import { create } from 'zustand';
import type { Notification } from '@nuestable/shared';

interface NotificationState {
  unreadCount: number;
  recentNotifications: Notification[];
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  decrementUnread: () => void;
  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  unreadCount: 0,
  recentNotifications: [],

  setUnreadCount: (count) => set({ unreadCount: count }),

  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),

  decrementUnread: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

  addNotification: (notification) =>
    set((state) => ({
      recentNotifications: [notification, ...state.recentNotifications].slice(0, 20),
      unreadCount: state.unreadCount + 1,
    })),

  clearNotifications: () => set({ recentNotifications: [], unreadCount: 0 }),
}));
