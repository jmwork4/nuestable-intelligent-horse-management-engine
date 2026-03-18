import { z } from "zod";
import { Surface } from "../types/horse.js";
import { EntryStatus, RaceClass, RaceStatus, RaceType } from "../types/race.js";

// ---------------------------------------------------------------------------
// Race condition
// ---------------------------------------------------------------------------

export const raceConditionSchema = z.object({
  minAge: z.number().int().min(2).max(20).nullable(),
  maxAge: z.number().int().min(2).max(20).nullable(),
  sexRestriction: z.string().max(20).nullable(),
  statesBred: z.boolean(),
  minClaimPrice: z.number().int().nonnegative().nullable(),
  maxClaimPrice: z.number().int().nonnegative().nullable(),
  maxEarnings: z.number().int().nonnegative().nullable(),
  maxWins: z.number().int().nonnegative().nullable(),
  conditionText: z.string().min(1).max(2000),
});

// ---------------------------------------------------------------------------
// Create race
// ---------------------------------------------------------------------------

export const createRaceSchema = z.object({
  organizationId: z.string().uuid(),
  trackId: z.string().uuid(),
  trackName: z.string().min(1).max(200),
  raceNumber: z.number().int().min(1).max(20),
  raceDate: z.coerce.date(),
  postTime: z.coerce.date().optional(),
  raceClass: z.nativeEnum(RaceClass),
  raceType: z.nativeEnum(RaceType).default(RaceType.FLAT),
  surface: z.nativeEnum(Surface),
  distance: z.number().positive().max(20), // furlongs
  purse: z.number().int().nonnegative(),
  conditions: raceConditionSchema,
  maxEntries: z.number().int().min(1).max(20).optional(),
});

export type CreateRaceSchema = z.infer<typeof createRaceSchema>;

// ---------------------------------------------------------------------------
// Create race entry
// ---------------------------------------------------------------------------

export const createRaceEntrySchema = z.object({
  raceId: z.string().uuid(),
  horseId: z.string().uuid(),
  jockeyName: z.string().max(200).optional(),
  postPosition: z.number().int().min(1).max(20).optional(),
  weight: z.number().int().min(100).max(140).optional(),
  morningLineOdds: z.string().max(20).optional(),
  medications: z.array(z.string().max(10)).optional(),
  equipment: z.array(z.string().max(20)).optional(),
  claimPrice: z.number().int().nonnegative().optional(),
});

export type CreateRaceEntrySchema = z.infer<typeof createRaceEntrySchema>;

// ---------------------------------------------------------------------------
// Record race result
// ---------------------------------------------------------------------------

export const recordRaceResultSchema = z.object({
  raceId: z.string().uuid(),
  entryId: z.string().uuid(),
  finishPosition: z.number().int().min(1),
  officialPosition: z.number().int().min(1),
  margin: z.string().max(20).optional(),
  finalTime: z.string().max(20).optional(),
  speedFigure: z.number().int().min(0).max(150).optional(),
  earnings: z.number().int().nonnegative(),
  claimedBy: z.string().max(200).optional(),
  disqualified: z.boolean().default(false),
  disqualificationReason: z.string().max(500).optional(),
});

export type RecordRaceResultSchema = z.infer<typeof recordRaceResultSchema>;

// ---------------------------------------------------------------------------
// Race list query
// ---------------------------------------------------------------------------

export const raceListQuerySchema = z.object({
  organizationId: z.string().uuid(),
  trackId: z.string().uuid().optional(),
  raceClass: z.nativeEnum(RaceClass).optional(),
  status: z.nativeEnum(RaceStatus).optional(),
  surface: z.nativeEnum(Surface).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  horseId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  sortBy: z
    .enum(["raceDate", "raceNumber", "purse", "raceClass", "createdAt"])
    .default("raceDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type RaceListQuerySchema = z.infer<typeof raceListQuerySchema>;

// ---------------------------------------------------------------------------
// Scratch entry
// ---------------------------------------------------------------------------

export const scratchEntrySchema = z.object({
  entryId: z.string().uuid(),
  status: z.enum([EntryStatus.SCRATCHED, EntryStatus.LATE_SCRATCHED]),
  scratchReason: z.string().min(1).max(500),
});

export type ScratchEntrySchema = z.infer<typeof scratchEntrySchema>;
