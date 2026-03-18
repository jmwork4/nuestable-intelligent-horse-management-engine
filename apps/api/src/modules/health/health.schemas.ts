import { z } from "zod";

// ---------------------------------------------------------------------------
// Enums (matching Prisma schema)
// ---------------------------------------------------------------------------

export const healthRecordTypeEnum = z.enum([
  "EXAM",
  "DENTAL",
  "FARRIER",
  "SURGERY",
  "IMAGING",
  "SCOPE",
  "BLOODWORK",
  "DEWORMING",
  "CHIROPRACTIC",
  "ACUPUNCTURE",
  "OTHER",
]);

export const injuryStatusEnum = z.enum(["ACTIVE", "HEALING", "RESOLVED", "CHRONIC"]);
export const injurySeverityEnum = z.enum(["MINOR", "MODERATE", "SEVERE", "CRITICAL"]);

// ---------------------------------------------------------------------------
// Health record (general)
// ---------------------------------------------------------------------------

export const createHealthRecordSchema = z.object({
  horseId: z.string(),
  type: healthRecordTypeEnum,
  date: z.coerce.date(),
  description: z.string().min(1).max(5000),
  vetName: z.string().max(200).optional(),
  findings: z.string().max(5000).optional(),
  treatment: z.string().max(5000).optional(),
  followUpDate: z.coerce.date().optional(),
  attachmentUrls: z.array(z.string()).optional(),
});
export type CreateHealthRecordInput = z.infer<typeof createHealthRecordSchema>;

// ---------------------------------------------------------------------------
// Medication schemas
// ---------------------------------------------------------------------------

export const createMedicationSchema = z.object({
  horseId: z.string(),
  medicationName: z.string().min(1).max(200),
  dosage: z.string().min(1).max(200),
  route: z.string().min(1).max(100),
  administeredAt: z.coerce.date(),
  administeredById: z.string(),
  withdrawalHours: z.number().int().nonnegative(),
  isControlled: z.boolean().default(false),
  notes: z.string().max(5000).optional(),
});
export type CreateMedicationInput = z.infer<typeof createMedicationSchema>;

// ---------------------------------------------------------------------------
// Vaccination schemas
// ---------------------------------------------------------------------------

export const createVaccinationSchema = z.object({
  horseId: z.string(),
  vaccine: z.string().min(1).max(200),
  batchNumber: z.string().max(100).optional(),
  givenDate: z.coerce.date(),
  expiresAt: z.coerce.date().optional(),
  vetName: z.string().max(200).optional(),
  notes: z.string().max(5000).optional(),
});
export type CreateVaccinationInput = z.infer<typeof createVaccinationSchema>;

// ---------------------------------------------------------------------------
// Injury schemas
// ---------------------------------------------------------------------------

export const createInjurySchema = z.object({
  horseId: z.string(),
  description: z.string().min(1).max(500),
  location: z.string().min(1).max(200),
  severity: injurySeverityEnum,
  dateOccurred: z.coerce.date(),
  treatmentPlan: z.string().max(5000).optional(),
  notes: z.string().max(5000).optional(),
});
export type CreateInjuryInput = z.infer<typeof createInjurySchema>;

export const updateInjurySchema = z.object({
  description: z.string().min(1).max(500).optional(),
  severity: injurySeverityEnum.optional(),
  treatmentPlan: z.string().max(5000).nullable().optional(),
  status: injuryStatusEnum.optional(),
  dateResolved: z.coerce.date().nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});
export type UpdateInjuryInput = z.infer<typeof updateInjurySchema>;

// ---------------------------------------------------------------------------
// Lab result schemas
// ---------------------------------------------------------------------------

export const createLabResultSchema = z.object({
  horseId: z.string(),
  testType: z.string().min(1).max(200),
  testDate: z.coerce.date(),
  resultDate: z.coerce.date().optional(),
  lab: z.string().max(200).optional(),
  results: z.any(),
  isNormal: z.boolean().optional(),
  notes: z.string().max(5000).optional(),
  attachmentUrl: z.string().url().optional(),
});
export type CreateLabResultInput = z.infer<typeof createLabResultSchema>;

// ---------------------------------------------------------------------------
// Query schemas
// ---------------------------------------------------------------------------

export const healthListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  search: z.string().optional(),
  sort: z.string().optional(),
  horseId: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});
export type HealthListQuery = z.infer<typeof healthListQuerySchema>;

export const horseIdParamSchema = z.object({
  horseId: z.string(),
});

export const idParamSchema = z.object({
  id: z.string(),
});
