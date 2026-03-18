import { z } from "zod";

// ---------------------------------------------------------------------------
// Enums (mirroring Prisma schema enums for Zod validation)
// ---------------------------------------------------------------------------

export const horseSexEnum = z.enum([
  "COLT",
  "FILLY",
  "GELDING",
  "MARE",
  "STALLION",
  "RIDGLING",
]);

export const horseStatusEnum = z.enum([
  "ACTIVE",
  "INJURED",
  "RETIRED",
  "SOLD",
  "DECEASED",
  "LAYUP",
  "BROODMARE",
]);

export const surfaceEnum = z.enum(["DIRT", "TURF", "SYNTHETIC", "ALL_WEATHER"]);

// ---------------------------------------------------------------------------
// Sub-schemas
// ---------------------------------------------------------------------------

export const ownershipShareInputSchema = z.object({
  userId: z.string(),
  ownerName: z.string().min(1),
  ownershipPct: z.number().min(0).max(100),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
});

// ---------------------------------------------------------------------------
// Request schemas
// ---------------------------------------------------------------------------

export const createHorseSchema = z.object({
  name: z.string().min(1).max(200),
  registeredName: z.string().max(200).optional(),
  tattooNumber: z.string().max(50).optional(),
  chipNumber: z.string().max(50).optional(),
  registrationNum: z.string().max(100).optional(),
  foalDate: z.coerce.date().optional(),
  sex: horseSexEnum,
  color: z.string().max(50).optional(),
  status: horseStatusEnum.optional(),
  sireId: z.string().optional(),
  damId: z.string().optional(),
  sireName: z.string().max(200).optional(),
  damName: z.string().max(200).optional(),
  profileImageUrl: z.string().url().optional(),
  notes: z.string().max(5000).optional(),
  currentBarnId: z.string().optional(),
  currentStallId: z.string().optional(),
  ownerships: z.array(ownershipShareInputSchema).optional(),
});
export type CreateHorseInput = z.infer<typeof createHorseSchema>;

export const updateHorseSchema = createHorseSchema.partial();
export type UpdateHorseInput = z.infer<typeof updateHorseSchema>;

export const addOwnershipSchema = ownershipShareInputSchema;
export type AddOwnershipInput = z.infer<typeof addOwnershipSchema>;

export const addMediaSchema = z.object({
  url: z.string().url(),
  type: z.enum(["PHOTO", "VIDEO", "DOCUMENT", "XRAY"]),
  caption: z.string().max(500).optional(),
  takenAt: z.coerce.date().optional(),
});
export type AddMediaInput = z.infer<typeof addMediaSchema>;

// ---------------------------------------------------------------------------
// Query schemas
// ---------------------------------------------------------------------------

export const horseListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  search: z.string().optional(),
  sort: z.string().optional(),
  status: horseStatusEnum.optional(),
  sex: horseSexEnum.optional(),
  barnId: z.string().optional(),
});
export type HorseListQuery = z.infer<typeof horseListQuerySchema>;

export const horseIdParamSchema = z.object({
  id: z.string(),
});
