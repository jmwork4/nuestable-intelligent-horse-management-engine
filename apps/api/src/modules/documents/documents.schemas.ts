import { z } from "zod";

// ---------------------------------------------------------------------------
// Enums (matching Prisma schema)
// ---------------------------------------------------------------------------

export const documentCategoryEnum = z.enum([
  "REGISTRATION",
  "COGGINS",
  "HEALTH_CERTIFICATE",
  "INSURANCE",
  "BILL_OF_SALE",
  "CONTRACT",
  "VET_RECORD",
  "FARRIER_RECORD",
  "JOCKEY_CLUB",
  "RACING_LICENSE",
  "OTHER",
]);

export const documentStatusEnum = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);

// ---------------------------------------------------------------------------
// Request schemas
// ---------------------------------------------------------------------------

export const createDocumentSchema = z.object({
  horseId: z.string().optional(),
  category: documentCategoryEnum,
  title: z.string().min(1).max(300),
  fileUrl: z.string().url(),
  fileSize: z.number().int().nonnegative(),
  mimeType: z.string().min(1),
  expiresAt: z.coerce.date().optional(),
});
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

export const updateDocumentSchema = z.object({
  horseId: z.string().nullable().optional(),
  category: documentCategoryEnum.optional(),
  title: z.string().min(1).max(300).optional(),
  status: documentStatusEnum.optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  aiExtractedData: z.any().optional(),
  aiConfidence: z.number().optional(),
});
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

export const uploadDocumentSchema = z.object({
  horseId: z.string().optional(),
  category: documentCategoryEnum,
  title: z.string().min(1).max(300),
  expiresAt: z.coerce.date().optional(),
});
export type UploadDocumentMeta = z.infer<typeof uploadDocumentSchema>;

// ---------------------------------------------------------------------------
// Query schemas
// ---------------------------------------------------------------------------

export const documentListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  search: z.string().optional(),
  sort: z.string().optional(),
  category: documentCategoryEnum.optional(),
  status: documentStatusEnum.optional(),
  horseId: z.string().optional(),
  expiringWithinDays: z.coerce.number().int().positive().optional(),
});
export type DocumentListQuery = z.infer<typeof documentListQuerySchema>;

export const documentIdParamSchema = z.object({
  id: z.string(),
});
