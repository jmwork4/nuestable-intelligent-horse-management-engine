import { z } from "zod";

// ---------------------------------------------------------------------------
// Enums (matching Prisma schema)
// ---------------------------------------------------------------------------

export const notificationChannelEnum = z.enum(["IN_APP", "EMAIL", "SMS", "PUSH"]);

export const notificationTypeEnum = z.enum([
  "RACE_ENTRY",
  "RACE_RESULT",
  "RACE_SCRATCH",
  "HEALTH_ALERT",
  "MEDICATION_DUE",
  "DOCUMENT_EXPIRING",
  "TASK_ASSIGNED",
  "TASK_DUE",
  "INVOICE_CREATED",
  "INVOICE_OVERDUE",
  "VOTE_OPENED",
  "VOTE_CLOSING",
  "MESSAGE_RECEIVED",
  "DAILY_REPORT",
  "GENERAL",
]);

// ---------------------------------------------------------------------------
// Request schemas
// ---------------------------------------------------------------------------

export const sendNotificationSchema = z.object({
  userId: z.string(),
  type: notificationTypeEnum,
  title: z.string().min(1).max(300),
  body: z.string().min(1).max(5000),
  data: z.record(z.unknown()).optional(),
  channel: notificationChannelEnum.default("IN_APP"),
});
export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;

export const updatePreferenceSchema = z.object({
  type: notificationTypeEnum,
  channel: notificationChannelEnum,
  enabled: z.boolean(),
});
export type UpdatePreferenceInput = z.infer<typeof updatePreferenceSchema>;

export const bulkPreferencesSchema = z.array(updatePreferenceSchema);
export type BulkPreferencesInput = z.infer<typeof bulkPreferencesSchema>;

// ---------------------------------------------------------------------------
// Query schemas
// ---------------------------------------------------------------------------

export const notificationListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  type: notificationTypeEnum.optional(),
  unreadOnly: z.coerce.boolean().optional(),
});
export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>;

export const notificationIdParamSchema = z.object({
  id: z.string(),
});
