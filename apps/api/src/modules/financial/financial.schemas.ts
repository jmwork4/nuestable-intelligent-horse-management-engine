import { z } from "zod";

// ---------------------------------------------------------------------------
// Enums (matching Prisma schema)
// ---------------------------------------------------------------------------

export const expenseCategoryEnum = z.enum([
  "TRAINING",
  "VETERINARY",
  "FARRIER",
  "FEED",
  "BOARDING",
  "TRANSPORT",
  "INSURANCE",
  "REGISTRATION",
  "JOCKEY_FEE",
  "EQUIPMENT",
  "MEDICATION",
  "THERAPY",
  "ADMIN",
  "OTHER",
]);

export const revenueCategoryEnum = z.enum([
  "PURSE_EARNINGS",
  "CLAIMING_SALE",
  "PRIVATE_SALE",
  "BREEDING",
  "INSURANCE_CLAIM",
  "SPONSORSHIP",
  "OTHER",
]);

export const invoiceStatusEnum = z.enum([
  "DRAFT",
  "SENT",
  "PAID",
  "OVERDUE",
  "VOID",
  "PARTIAL",
]);

export const payoutTypeEnum = z.enum([
  "PURSE_DISTRIBUTION",
  "SALE_PROCEEDS",
  "INSURANCE_PAYOUT",
  "BREEDING_FEE",
  "OTHER",
]);

// ---------------------------------------------------------------------------
// Expense schemas
// ---------------------------------------------------------------------------

export const createExpenseSchema = z.object({
  horseId: z.string().optional(),
  category: expenseCategoryEnum,
  description: z.string().min(1).max(500),
  amount: z.number().positive(),
  date: z.coerce.date(),
  vendorName: z.string().max(200).optional(),
  invoiceId: z.string().optional(),
  isRecurring: z.boolean().default(false),
});
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

// ---------------------------------------------------------------------------
// Revenue schemas
// ---------------------------------------------------------------------------

export const createRevenueSchema = z.object({
  horseId: z.string().optional(),
  category: revenueCategoryEnum,
  description: z.string().min(1).max(500),
  amount: z.number().positive(),
  date: z.coerce.date(),
  source: z.string().max(200).optional(),
});
export type CreateRevenueInput = z.infer<typeof createRevenueSchema>;

// ---------------------------------------------------------------------------
// Invoice schemas
// ---------------------------------------------------------------------------

export const createInvoiceSchema = z.object({
  ownerId: z.string().optional(),
  ownerName: z.string().min(1).max(200),
  dueDate: z.coerce.date().optional(),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
  notes: z.string().max(5000).optional(),
});
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export const updateInvoiceSchema = z.object({
  status: invoiceStatusEnum.optional(),
  paidAt: z.coerce.date().nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;

// ---------------------------------------------------------------------------
// Payout schemas
// ---------------------------------------------------------------------------

export const createPayoutSchema = z.object({
  invoiceId: z.string().optional(),
  ownerId: z.string().optional(),
  ownerName: z.string().min(1).max(200),
  horseId: z.string().optional(),
  amount: z.number().positive(),
  type: payoutTypeEnum,
  date: z.coerce.date(),
  notes: z.string().max(5000).optional(),
});
export type CreatePayoutInput = z.infer<typeof createPayoutSchema>;

// ---------------------------------------------------------------------------
// Query schemas
// ---------------------------------------------------------------------------

export const financialListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  search: z.string().optional(),
  sort: z.string().optional(),
  horseId: z.string().optional(),
  category: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});
export type FinancialListQuery = z.infer<typeof financialListQuerySchema>;

export const costPerHorseQuerySchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  horseId: z.string().optional(),
});
export type CostPerHorseQuery = z.infer<typeof costPerHorseQuerySchema>;

export const invoiceIdParamSchema = z.object({
  id: z.string(),
});

export const ownerIdParamSchema = z.object({
  ownerId: z.string(),
});
