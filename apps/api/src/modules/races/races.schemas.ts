import { z } from "zod";

// ---------------------------------------------------------------------------
// Enums (matching Prisma schema)
// ---------------------------------------------------------------------------

export const raceTypeEnum = z.enum([
  "MAIDEN",
  "CLAIMING",
  "ALLOWANCE",
  "STAKES",
  "GRADED_STAKES",
  "HANDICAP",
  "MAIDEN_CLAIMING",
  "STARTER_ALLOWANCE",
  "OPTIONAL_CLAIMING",
  "FUTURITY",
  "DERBY",
  "OTHER",
]);

export const raceStatusEnum = z.enum([
  "SCHEDULED",
  "ENTRIES_OPEN",
  "ENTRIES_CLOSED",
  "SCRATCHES_FINAL",
  "IN_PROGRESS",
  "OFFICIAL",
  "CANCELLED",
  "POSTPONED",
]);

export const entryStatusEnum = z.enum([
  "ENTERED",
  "CONFIRMED",
  "SCRATCHED",
  "FINISHED",
  "DQ",
]);

export const surfaceEnum = z.enum(["DIRT", "TURF", "SYNTHETIC", "ALL_WEATHER"]);

// ---------------------------------------------------------------------------
// Request schemas
// ---------------------------------------------------------------------------

export const createRaceSchema = z.object({
  trackName: z.string().min(1),
  trackCode: z.string().optional(),
  raceNumber: z.number().int().positive().optional(),
  raceName: z.string().optional(),
  raceDate: z.coerce.date(),
  postTime: z.coerce.date().optional(),
  raceType: raceTypeEnum,
  surface: surfaceEnum.optional(),
  distance: z.string().optional(),
  distanceFurlongs: z.number().positive().optional(),
  purse: z.number().nonnegative().optional(),
  claimingPrice: z.number().nonnegative().optional(),
  conditions: z.string().optional(),
  raceClass: z.string().optional(),
  status: raceStatusEnum.default("SCHEDULED"),
  isStakes: z.boolean().default(false),
  stakesGrade: z.string().optional(),
  entryDeadline: z.coerce.date().optional(),
  scratchDeadline: z.coerce.date().optional(),
});
export type CreateRaceInput = z.infer<typeof createRaceSchema>;

export const updateRaceSchema = createRaceSchema.partial();
export type UpdateRaceInput = z.infer<typeof updateRaceSchema>;

export const createEntrySchema = z.object({
  horseId: z.string(),
  jockeyName: z.string().optional(),
  postPosition: z.number().int().positive().optional(),
  weight: z.string().optional(),
  morningLineOdds: z.string().optional(),
  medication: z.string().optional(),
  equipment: z.string().optional(),
  status: entryStatusEnum.default("ENTERED"),
});
export type CreateEntryInput = z.infer<typeof createEntrySchema>;

export const updateEntrySchema = z.object({
  jockeyName: z.string().optional(),
  postPosition: z.number().int().positive().optional(),
  weight: z.string().optional(),
  morningLineOdds: z.string().optional(),
  medication: z.string().optional(),
  equipment: z.string().optional(),
  status: entryStatusEnum.optional(),
  scratchReason: z.string().optional(),
  finishPosition: z.number().int().optional(),
  officialTime: z.string().optional(),
  margin: z.string().optional(),
  speedFigure: z.number().int().optional(),
  purseEarned: z.number().nonnegative().optional(),
  classMovement: z.string().optional(),
});
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;

export const tripNoteSchema = z.object({
  horseId: z.string(),
  note: z.string().min(1).max(5000),
  tags: z.array(z.string()).optional(),
});
export type TripNoteInput = z.infer<typeof tripNoteSchema>;

// ---------------------------------------------------------------------------
// Query schemas
// ---------------------------------------------------------------------------

export const raceListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  search: z.string().optional(),
  sort: z.string().optional(),
  status: raceStatusEnum.optional(),
  raceType: raceTypeEnum.optional(),
  surface: surfaceEnum.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});
export type RaceListQuery = z.infer<typeof raceListQuerySchema>;

export const raceIdParamSchema = z.object({
  id: z.string(),
});

export const raceEntryParamSchema = z.object({
  id: z.string(),
  entryId: z.string(),
});

export const eligibilityParamSchema = z.object({
  horseId: z.string(),
});
