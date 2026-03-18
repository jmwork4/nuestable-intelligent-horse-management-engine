import { RaceClass } from "../types/race.js";

// ---------------------------------------------------------------------------
// Race class metadata
// ---------------------------------------------------------------------------

export interface RaceClassDefinition {
  value: RaceClass;
  label: string;
  abbreviation: string;
  description: string;
  tier: number; // 1 = highest (Graded I), 8 = lowest (Maiden Claiming)
  claimingAllowed: boolean;
}

export const RACE_CLASS_DEFINITIONS: readonly RaceClassDefinition[] = [
  {
    value: RaceClass.GRADED_I,
    label: "Graded Stakes I",
    abbreviation: "G1",
    description:
      "The highest level of stakes racing. Features the best horses competing for the largest purses.",
    tier: 1,
    claimingAllowed: false,
  },
  {
    value: RaceClass.GRADED_II,
    label: "Graded Stakes II",
    abbreviation: "G2",
    description: "High-level stakes racing, one tier below Grade I events.",
    tier: 2,
    claimingAllowed: false,
  },
  {
    value: RaceClass.GRADED_III,
    label: "Graded Stakes III",
    abbreviation: "G3",
    description: "Quality stakes races featuring competitive fields.",
    tier: 3,
    claimingAllowed: false,
  },
  {
    value: RaceClass.LISTED,
    label: "Listed Stakes",
    abbreviation: "LR",
    description: "Stakes races that are not graded but carry black-type designation.",
    tier: 4,
    claimingAllowed: false,
  },
  {
    value: RaceClass.STAKES,
    label: "Stakes",
    abbreviation: "STK",
    description: "Non-graded, non-listed stakes races including overnight and restricted stakes.",
    tier: 4,
    claimingAllowed: false,
  },
  {
    value: RaceClass.ALLOWANCE,
    label: "Allowance",
    abbreviation: "ALW",
    description:
      "Non-claiming races with eligibility conditions based on previous earnings or wins.",
    tier: 5,
    claimingAllowed: false,
  },
  {
    value: RaceClass.ALLOWANCE_OPTIONAL_CLAIMING,
    label: "Allowance Optional Claiming",
    abbreviation: "AOC",
    description:
      "Allowance races where horses may optionally be entered for a claiming price.",
    tier: 5,
    claimingAllowed: true,
  },
  {
    value: RaceClass.STARTER_ALLOWANCE,
    label: "Starter Allowance",
    abbreviation: "SA",
    description:
      "Allowance-like races restricted to horses that have started for a specified claiming price.",
    tier: 6,
    claimingAllowed: false,
  },
  {
    value: RaceClass.STARTER_HANDICAP,
    label: "Starter Handicap",
    abbreviation: "SH",
    description:
      "Handicap races restricted to horses that have started for a specified claiming price.",
    tier: 6,
    claimingAllowed: false,
  },
  {
    value: RaceClass.OPTIONAL_CLAIMING,
    label: "Optional Claiming",
    abbreviation: "OC",
    description: "Races where horses may or may not be entered for a claiming price.",
    tier: 6,
    claimingAllowed: true,
  },
  {
    value: RaceClass.CLAIMING,
    label: "Claiming",
    abbreviation: "CLM",
    description:
      "Races where every entered horse is available for purchase (claim) at a stated price.",
    tier: 7,
    claimingAllowed: true,
  },
  {
    value: RaceClass.MAIDEN_SPECIAL_WEIGHT,
    label: "Maiden Special Weight",
    abbreviation: "MSW",
    description: "Non-claiming races for horses that have never won a race.",
    tier: 7,
    claimingAllowed: false,
  },
  {
    value: RaceClass.MAIDEN,
    label: "Maiden",
    abbreviation: "MDN",
    description: "General maiden races for horses that have never won.",
    tier: 8,
    claimingAllowed: false,
  },
  {
    value: RaceClass.MAIDEN_CLAIMING,
    label: "Maiden Claiming",
    abbreviation: "MCL",
    description: "Claiming races restricted to horses that have never won a race.",
    tier: 8,
    claimingAllowed: true,
  },
] as const;

export const RACE_CLASS_MAP: Readonly<Record<RaceClass, RaceClassDefinition>> =
  Object.fromEntries(
    RACE_CLASS_DEFINITIONS.map((def) => [def.value, def]),
  ) as Record<RaceClass, RaceClassDefinition>;

/**
 * Standard purse distribution percentages by finish position.
 * Based on typical North American Thoroughbred racing.
 */
export const PURSE_DISTRIBUTION: readonly number[] = [
  0.6,   // 1st — 60%
  0.2,   // 2nd — 20%
  0.1,   // 3rd — 10%
  0.05,  // 4th — 5%
  0.03,  // 5th — 3%
  0.02,  // 6th+ — 2%
] as const;

/**
 * Common race distances in furlongs with labels.
 */
export const COMMON_DISTANCES: readonly { furlongs: number; label: string }[] = [
  { furlongs: 4.5, label: "4 1/2 Furlongs" },
  { furlongs: 5, label: "5 Furlongs" },
  { furlongs: 5.5, label: "5 1/2 Furlongs" },
  { furlongs: 6, label: "6 Furlongs" },
  { furlongs: 6.5, label: "6 1/2 Furlongs" },
  { furlongs: 7, label: "7 Furlongs" },
  { furlongs: 8, label: "1 Mile" },
  { furlongs: 8.32, label: "1 Mile 70 Yards" },
  { furlongs: 8.5, label: "1 1/16 Miles" },
  { furlongs: 9, label: "1 1/8 Miles" },
  { furlongs: 10, label: "1 1/4 Miles" },
  { furlongs: 12, label: "1 1/2 Miles" },
  { furlongs: 14, label: "1 3/4 Miles" },
  { furlongs: 16, label: "2 Miles" },
] as const;
