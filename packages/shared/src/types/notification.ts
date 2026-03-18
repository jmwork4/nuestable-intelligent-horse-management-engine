// ---------------------------------------------------------------------------
// Notification types — mandatory vs preference alerts, channels, delivery
// ---------------------------------------------------------------------------

export enum NotificationChannel {
  IN_APP = "IN_APP",
  EMAIL = "EMAIL",
  SMS = "SMS",
  PUSH = "PUSH",
}

export enum NotificationPriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum NotificationCategory {
  // Mandatory — always delivered, cannot unsubscribe
  WITHDRAWAL_ALERT = "WITHDRAWAL_ALERT",
  DOCUMENT_EXPIRY = "DOCUMENT_EXPIRY",
  REGULATORY_DEADLINE = "REGULATORY_DEADLINE",
  RACE_SCRATCH = "RACE_SCRATCH",
  EMERGENCY_VET = "EMERGENCY_VET",

  // Preference — user can configure channels
  RACE_ENTRY_CONFIRMATION = "RACE_ENTRY_CONFIRMATION",
  RACE_RESULT = "RACE_RESULT",
  INVOICE_ISSUED = "INVOICE_ISSUED",
  PAYMENT_RECEIVED = "PAYMENT_RECEIVED",
  TASK_ASSIGNED = "TASK_ASSIGNED",
  TASK_OVERDUE = "TASK_OVERDUE",
  HEALTH_REMINDER = "HEALTH_REMINDER",
  VACCINATION_DUE = "VACCINATION_DUE",
  GENERAL = "GENERAL",
}

export enum DeliveryStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  FAILED = "FAILED",
  READ = "READ",
}

export interface Notification {
  id: string;
  organizationId: string;
  recipientId: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  channels: NotificationDelivery[];
  readAt: Date | null;
  createdAt: Date;
}

export interface NotificationDelivery {
  id: string;
  notificationId: string;
  channel: NotificationChannel;
  status: DeliveryStatus;
  sentAt: Date | null;
  deliveredAt: Date | null;
  failureReason: string | null;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  organizationId: string;
  category: NotificationCategory;
  channels: NotificationChannel[];
  enabled: boolean;
  updatedAt: Date;
}

export interface SendNotificationInput {
  organizationId: string;
  recipientId: string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channels?: NotificationChannel[];
}

export interface UpdateNotificationPreferenceInput {
  userId: string;
  organizationId: string;
  category: NotificationCategory;
  channels: NotificationChannel[];
  enabled: boolean;
}

/**
 * Mandatory notification categories that cannot be disabled by users.
 */
export const MANDATORY_NOTIFICATION_CATEGORIES: readonly NotificationCategory[] = [
  NotificationCategory.WITHDRAWAL_ALERT,
  NotificationCategory.DOCUMENT_EXPIRY,
  NotificationCategory.REGULATORY_DEADLINE,
  NotificationCategory.RACE_SCRATCH,
  NotificationCategory.EMERGENCY_VET,
] as const;
