import { z } from "zod";

// ---------------------------------------------------------------------------
// Enums (matching Prisma schema)
// ---------------------------------------------------------------------------

export const taskStatusEnum = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

export const taskPriorityEnum = z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]);

export const feedMealEnum = z.enum(["AM", "MIDDAY", "PM", "SUPPLEMENT"]);

export const stallStatusEnum = z.enum([
  "AVAILABLE",
  "OCCUPIED",
  "MAINTENANCE",
  "RESERVED",
]);

export const checklistStatusEnum = z.enum(["IN_PROGRESS", "COMPLETED"]);

// ---------------------------------------------------------------------------
// Checklist schemas
// ---------------------------------------------------------------------------

export const createChecklistSchema = z.object({
  date: z.coerce.date(),
  items: z.array(z.object({
    horseId: z.string().optional(),
    description: z.string().min(1).max(500),
    sortOrder: z.number().int().nonnegative().default(0),
  })).min(1),
});
export type CreateChecklistInput = z.infer<typeof createChecklistSchema>;

export const completeChecklistItemSchema = z.object({
  completedAt: z.coerce.date().optional(),
});
export type CompleteChecklistItemInput = z.infer<typeof completeChecklistItemSchema>;

// ---------------------------------------------------------------------------
// Feed log schemas
// ---------------------------------------------------------------------------

export const createFeedLogSchema = z.object({
  horseId: z.string(),
  date: z.coerce.date(),
  meal: feedMealEnum,
  feedType: z.string().min(1).max(200),
  quantity: z.string().min(1),
  unit: z.string().min(1),
  supplements: z.string().optional(),
  notes: z.string().max(2000).optional(),
});
export type CreateFeedLogInput = z.infer<typeof createFeedLogSchema>;

// ---------------------------------------------------------------------------
// Therapy log schemas
// ---------------------------------------------------------------------------

export const createTherapyLogSchema = z.object({
  horseId: z.string(),
  date: z.coerce.date(),
  therapyType: z.string().min(1).max(200),
  duration: z.number().int().positive().optional(),
  provider: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});
export type CreateTherapyLogInput = z.infer<typeof createTherapyLogSchema>;

// ---------------------------------------------------------------------------
// Task schemas
// ---------------------------------------------------------------------------

export const createTaskSchema = z.object({
  horseId: z.string().optional(),
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional(),
  priority: taskPriorityEnum.default("NORMAL"),
  assigneeId: z.string(),
  dueDate: z.coerce.date().optional(),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(5000).nullable().optional(),
  priority: taskPriorityEnum.optional(),
  assigneeId: z.string().nullable().optional(),
  status: taskStatusEnum.optional(),
  dueDate: z.coerce.date().nullable().optional(),
});
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

// ---------------------------------------------------------------------------
// Operation log schemas
// ---------------------------------------------------------------------------

export const createOperationLogSchema = z.object({
  horseId: z.string().optional(),
  category: z.string().min(1).max(100),
  content: z.string().min(1).max(5000),
  isPinned: z.boolean().default(false),
});
export type CreateOperationLogInput = z.infer<typeof createOperationLogSchema>;

// ---------------------------------------------------------------------------
// Stall update schema
// ---------------------------------------------------------------------------

export const updateStallSchema = z.object({
  status: stallStatusEnum.optional(),
  horseId: z.string().nullable().optional(),
});
export type UpdateStallInput = z.infer<typeof updateStallSchema>;

// ---------------------------------------------------------------------------
// Query schemas
// ---------------------------------------------------------------------------

export const operationsListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  search: z.string().optional(),
  sort: z.string().optional(),
  horseId: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});
export type OperationsListQuery = z.infer<typeof operationsListQuerySchema>;

export const checklistIdParamSchema = z.object({
  id: z.string(),
});

export const checklistItemParamSchema = z.object({
  id: z.string(),
  itemId: z.string(),
});

export const taskIdParamSchema = z.object({
  id: z.string(),
});

export const stallIdParamSchema = z.object({
  id: z.string(),
});
