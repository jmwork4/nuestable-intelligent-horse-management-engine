// ---------------------------------------------------------------------------
// Race intelligence types
// ---------------------------------------------------------------------------

import type { Surface } from "./horse.js";

export enum RaceClass {
  MAIDEN = "MAIDEN",
  MAIDEN_SPECIAL_WEIGHT = "MAIDEN_SPECIAL_WEIGHT",
  MAIDEN_CLAIMING = "MAIDEN_CLAIMING",
  CLAIMING = "CLAIMING",
  OPTIONAL_CLAIMING = "OPTIONAL_CLAIMING",
  ALLOWANCE = "ALLOWANCE",
  ALLOWANCE_OPTIONAL_CLAIMING = "ALLOWANCE_OPTIONAL_CLAIMING",
  STARTER_ALLOWANCE = "STARTER_ALLOWANCE",
  STARTER_HANDICAP = "STARTER_HANDICAP",
  STAKES = "STAKES",
  LISTED = "LISTED",
  GRADED_III = "GRADED_III",
  GRADED_II = "GRADED_II",
  GRADED_I = "GRADED_I",
}

export enum RaceType {
  FLAT = "FLAT",
  STEEPLECHASE = "STEEPLECHASE",
  HURDLE = "HURDLE",
}

export enum RaceStatus {
  SCHEDULED = "SCHEDULED",
  ENTRIES_OPEN = "ENTRIES_OPEN",
  ENTRIES_CLOSED = "ENTRIES_CLOSED",
  SCRATCHES_POSTED = "SCRATCHES_POSTED",
  IN_PROGRESS = "IN_PROGRESS",
  OFFICIAL = "OFFICIAL",
  CANCELLED = "CANCELLED",
}

export enum EntryStatus {
  NOMINATED = "NOMINATED",
  ENTERED = "ENTERED",
  SCRATCHED = "SCRATCHED",
  LATE_SCRATCHED = "LATE_SCRATCHED",
  STARTED = "STARTED",
  FINISHED = "FINISHED",
  DID_NOT_FINISH = "DID_NOT_FINISH",
  DISQUALIFIED = "DISQUALIFIED",
}

export interface RaceCondition {
  minAge: number | null;
  maxAge: number | null;
  sexRestriction: string | null; // e.g. "F&M", "C&G"
  statesBred: boolean;
  minClaimPrice: number | null;
  maxClaimPrice: number | null;
  maxEarnings: number | null;
  maxWins: number | null;
  conditionText: string;
}

export interface Race {
  id: string;
  organizationId: string;
  trackId: string;
  trackName: string;
  raceNumber: number;
  raceDate: Date;
  postTime: Date | null;
  raceClass: RaceClass;
  raceType: RaceType;
  surface: Surface;
  distance: number; // furlongs
  purse: number; // total purse in cents
  conditions: RaceCondition;
  status: RaceStatus;
  maxEntries: number | null;
  entries: RaceEntry[];
  results: RaceResult[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RaceEntry {
  id: string;
  raceId: string;
  horseId: string;
  horseName: string;
  jockeyName: string | null;
  postPosition: number | null;
  weight: number | null; // lbs
  morningLineOdds: string | null;
  medications: string[]; // e.g. ["L"] for Lasix
  equipment: string[];
  status: EntryStatus;
  scratchReason: string | null;
  claimPrice: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RaceResult {
  id: string;
  raceId: string;
  entryId: string;
  horseId: string;
  horseName: string;
  finishPosition: number;
  officialPosition: number;
  margin: string | null; // e.g. "2 1/4"
  finalTime: string | null; // e.g. "1:10.23"
  speedFigure: number | null;
  earnings: number; // cents
  claimedBy: string | null;
  disqualified: boolean;
  disqualificationReason: string | null;
  createdAt: Date;
}

export interface EligibilityCheck {
  horseId: string;
  raceId: string;
  eligible: boolean;
  reasons: EligibilityReason[];
}

export interface EligibilityReason {
  rule: string;
  passed: boolean;
  message: string;
}

export interface CreateRaceInput {
  organizationId: string;
  trackId: string;
  trackName: string;
  raceNumber: number;
  raceDate: Date | string;
  postTime?: Date | string;
  raceClass: RaceClass;
  raceType: RaceType;
  surface: Surface;
  distance: number;
  purse: number;
  conditions: RaceCondition;
  maxEntries?: number;
}

export interface CreateRaceEntryInput {
  raceId: string;
  horseId: string;
  jockeyName?: string;
  postPosition?: number;
  weight?: number;
  morningLineOdds?: string;
  medications?: string[];
  equipment?: string[];
  claimPrice?: number;
}

export interface RecordRaceResultInput {
  raceId: string;
  entryId: string;
  finishPosition: number;
  officialPosition: number;
  margin?: string;
  finalTime?: string;
  speedFigure?: number;
  earnings: number;
  claimedBy?: string;
  disqualified?: boolean;
  disqualificationReason?: string;
}
