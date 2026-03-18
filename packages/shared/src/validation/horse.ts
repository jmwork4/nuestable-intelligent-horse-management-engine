import { z } from "zod";
import { HorseBreed, HorseSex, HorseStatus, Surface } from "../types/horse.js";

// ---------------------------------------------------------------------------
// Pedigree
// ---------------------------------------------------------------------------

export const pedigreeSchema = z.object({
  sire: z.string().nullable(),
  dam: z.string().nullable(),
  sireOfDam: z.string().nullable(),
  sireLineage: z.array(z.string()).optional(),
  damLineage: z.array(z.string()).optional(),
});

// ---------------------------------------------------------------------------
// Ownership share (within create/update horse)
// ---------------------------------------------------------------------------

export const ownershipShareInputSchema = z.object({
  userId: z.string().uuid(),
  ownerName: z.string().min(1).max(200),
  percentage: z.number().min(0).max(100),
  effectiveDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
});

// ---------------------------------------------------------------------------
// Create horse
// ---------------------------------------------------------------------------

export const createHorseSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(100),
  registeredName: z.string().max(100).optional(),
  tattooNumber: z.string().max(50).optional(),
  chipNumber: z.string().max(50).optional(),
  foalDate: z.coerce.date().optional(),
  sex: z.nativeEnum(HorseSex),
  breed: z.nativeEnum(HorseBreed),
  color: z.string().max(50).optional(),
  status: z.nativeEnum(HorseStatus).default(HorseStatus.ACTIVE),
  pedigree: pedigreeSchema.optional(),
  imageUrl: z.string().url().optional(),
  notes: z.string().max(5000).optional(),
  barnId: z.string().uuid().optional(),
  stallId: z.string().uuid().optional(),
  trainerId: z.string().uuid().optional(),
  surfacePreferences: z.array(z.nativeEnum(Surface)).optional(),
  claimPrice: z.number().int().nonnegative().optional(),
  ownershipShares: z
    .array(ownershipShareInputSchema)
    .refine(
      (shares) => {
        if (shares.length === 0) return true;
        const total = shares.reduce((sum, s) => sum + s.percentage, 0);
        return Math.abs(total - 100) < 0.01;
      },
      { message: "Ownership shares must total 100%" },
    )
    .optional(),
});

export type CreateHorseSchema = z.infer<typeof createHorseSchema>;

// ---------------------------------------------------------------------------
// Update horse
// ---------------------------------------------------------------------------

export const updateHorseSchema = createHorseSchema
  .omit({ organizationId: true })
  .partial()
  .extend({
    id: z.string().uuid(),
  });

export type UpdateHorseSchema = z.infer<typeof updateHorseSchema>;

// ---------------------------------------------------------------------------
// Horse query params
// ---------------------------------------------------------------------------

export const horseListQuerySchema = z.object({
  organizationId: z.string().uuid(),
  status: z.nativeEnum(HorseStatus).optional(),
  sex: z.nativeEnum(HorseSex).optional(),
  breed: z.nativeEnum(HorseBreed).optional(),
  trainerId: z.string().uuid().optional(),
  barnId: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  sortBy: z
    .enum(["name", "status", "breed", "sex", "createdAt", "updatedAt"])
    .default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type HorseListQuerySchema = z.infer<typeof horseListQuerySchema>;
