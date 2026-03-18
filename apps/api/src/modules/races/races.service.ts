import type { PrismaClient, Prisma } from "@prisma/client";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../../config/constants.js";
import { NotFoundError, ValidationError } from "../../lib/errors.js";
import type {
  CreateRaceInput,
  UpdateRaceInput,
  CreateEntryInput,
  UpdateEntryInput,
  TripNoteInput,
  RaceListQuery,
} from "./races.schemas.js";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EligibilityMatch {
  raceId: string;
  trackName: string;
  raceDate: Date;
  raceType: string;
  distance: string | null;
  surface: string | null;
  purse: any;
  eligible: boolean;
  confidenceScore: number;
  reasons: { rule: string; passed: boolean; message: string }[];
}

/**
 * Map sex restriction codes used in race conditions to the horse sexes they allow.
 * "F&M" = Fillies and Mares only; "C&G" = Colts and Geldings only.
 */
const SEX_RESTRICTION_MAP: Record<string, string[]> = {
  "F&M": ["FILLY", "MARE"],
  "F": ["FILLY"],
  "M": ["MARE"],
  "C&G": ["COLT", "GELDING", "RIDGLING"],
  "C": ["COLT", "STALLION", "RIDGLING"],
};

export class RaceService {
  constructor(private readonly prisma: PrismaClient) {}

  // ---------------------------------------------------------------------------
  // Race CRUD
  // ---------------------------------------------------------------------------

  async list(orgId: string, query: RaceListQuery): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const where: Prisma.RaceWhereInput = {
      orgId,
    };

    if (query.search) {
      where.OR = [
        { trackName: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query.status) where.status = query.status;
    if (query.raceType) where.raceType = query.raceType;
    if (query.surface) where.surface = query.surface;
    if (query.dateFrom || query.dateTo) {
      where.raceDate = {};
      if (query.dateFrom) (where.raceDate as any).gte = query.dateFrom;
      if (query.dateTo) (where.raceDate as any).lte = query.dateTo;
    }

    let orderBy: Prisma.RaceOrderByWithRelationInput = { raceDate: "desc" };
    if (query.sort) {
      const [field, dir] = query.sort.split(":");
      if (field && (dir === "asc" || dir === "desc")) {
        orderBy = { [field]: dir };
      }
    }

    const [races, total] = await Promise.all([
      this.prisma.race.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          entries: { select: { id: true, horseId: true, status: true } },
        },
      }),
      this.prisma.race.count({ where }),
    ]);

    return {
      data: races,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(orgId: string, raceId: string): Promise<any> {
    const race = await this.prisma.race.findFirst({
      where: { id: raceId, orgId },
      include: {
        entries: true,
      },
    });
    if (!race) {
      throw new NotFoundError("Race", raceId);
    }
    return race;
  }

  async create(orgId: string, input: CreateRaceInput): Promise<any> {
    return this.prisma.race.create({
      data: {
        ...input,
        orgId,
        status: input.status ?? "SCHEDULED",
      },
      include: { entries: true },
    });
  }

  async update(orgId: string, raceId: string, input: UpdateRaceInput): Promise<any> {
    await this.getById(orgId, raceId);
    return this.prisma.race.update({
      where: { id: raceId },
      data: {
        ...input,
      },
      include: { entries: true },
    });
  }

  // ---------------------------------------------------------------------------
  // Entry management
  // ---------------------------------------------------------------------------

  async addEntry(orgId: string, raceId: string, input: CreateEntryInput): Promise<any> {
    await this.getById(orgId, raceId);

    // Fetch horse to verify it exists in this org
    const horse = await this.prisma.horse.findFirst({
      where: { id: input.horseId, orgId },
      select: { name: true },
    });
    if (!horse) {
      throw new NotFoundError("Horse", input.horseId);
    }

    return this.prisma.raceEntry.create({
      data: {
        orgId,
        raceId,
        horseId: input.horseId,
        jockeyName: input.jockeyName ?? null,
        postPosition: input.postPosition ?? null,
        weight: input.weight ?? null,
        morningLineOdds: input.morningLineOdds ?? null,
        medication: input.medication ?? null,
        equipment: input.equipment ?? null,
        status: input.status ?? "ENTERED",
      },
    });
  }

  async updateEntry(
    orgId: string,
    raceId: string,
    entryId: string,
    input: UpdateEntryInput,
  ): Promise<any> {
    await this.getById(orgId, raceId);

    const entry = await this.prisma.raceEntry.findFirst({
      where: { id: entryId, raceId },
    });
    if (!entry) {
      throw new NotFoundError("Race entry", entryId);
    }

    return this.prisma.raceEntry.update({
      where: { id: entryId },
      data: {
        ...input,
        scratchReason: input.scratchReason ?? undefined,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Eligibility checking
  // ---------------------------------------------------------------------------

  async checkEligibility(orgId: string, horseId: string): Promise<EligibilityMatch[]> {
    const horse = await this.prisma.horse.findFirst({
      where: { id: horseId, orgId },
    });
    if (!horse) {
      throw new NotFoundError("Horse", horseId);
    }

    // Calculate horse age
    const now = new Date();
    let horseAge: number | null = null;
    if (horse.foalDate) {
      const birthYear = new Date(horse.foalDate).getFullYear();
      horseAge = now.getFullYear() - birthYear;
    }

    // Get win count from race entries
    const winCount = await this.prisma.raceEntry.count({
      where: {
        horseId,
        finishPosition: 1,
        status: "FINISHED",
        race: { orgId },
      },
    });

    // Get upcoming races
    const upcomingRaces = await this.prisma.race.findMany({
      where: {
        orgId,
        raceDate: { gte: now },
        status: { in: ["SCHEDULED", "ENTRIES_OPEN"] },
      },
      orderBy: { raceDate: "asc" },
      take: 50,
    });

    const matches: EligibilityMatch[] = [];

    for (const race of upcomingRaces) {
      const reasons: { rule: string; passed: boolean; message: string }[] = [];
      let passedCount = 0;
      let totalChecks = 0;

      // Race type / class eligibility -- maiden horses should not enter non-maiden classes if they have wins
      if (race.raceType === "MAIDEN" || race.raceType === "MAIDEN_CLAIMING") {
        totalChecks++;
        const passed = winCount === 0;
        if (passed) passedCount++;
        reasons.push({
          rule: "maidenEligibility",
          passed,
          message: passed
            ? "Horse has no wins; eligible for maiden race"
            : `Horse has ${winCount} win(s); ineligible for maiden race`,
        });
      }

      // Surface preference (informational)
      const surfaceMatch = race.surface != null;

      const eligible = reasons.length === 0 || reasons.every((r) => r.passed);
      const confidenceScore =
        totalChecks === 0
          ? surfaceMatch
            ? 0.8
            : 0.6
          : (passedCount / totalChecks) * (surfaceMatch ? 1.0 : 0.85);

      matches.push({
        raceId: race.id,
        trackName: race.trackName,
        raceDate: race.raceDate,
        raceType: race.raceType,
        distance: race.distance,
        surface: race.surface,
        purse: race.purse,
        eligible,
        confidenceScore: Math.round(confidenceScore * 100) / 100,
        reasons,
      });
    }

    matches.sort((a, b) => b.confidenceScore - a.confidenceScore);

    return matches;
  }

  // ---------------------------------------------------------------------------
  // Race day dashboard
  // ---------------------------------------------------------------------------

  async getDashboard(orgId: string): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayRaces, totalEntries, scratchedCount] = await Promise.all([
      this.prisma.race.findMany({
        where: {
          orgId,
          raceDate: { gte: today, lt: tomorrow },
        },
        include: {
          entries: true,
        },
        orderBy: { raceNumber: "asc" },
      }),
      this.prisma.raceEntry.count({
        where: {
          race: {
            orgId,
            raceDate: { gte: today, lt: tomorrow },
          },
          status: { in: ["ENTERED", "CONFIRMED"] },
        },
      }),
      this.prisma.raceEntry.count({
        where: {
          race: {
            orgId,
            raceDate: { gte: today, lt: tomorrow },
          },
          status: "SCRATCHED",
        },
      }),
    ]);

    return {
      date: today.toISOString().slice(0, 10),
      raceCount: todayRaces.length,
      totalEntries,
      scratchedCount,
      races: todayRaces,
    };
  }

  // ---------------------------------------------------------------------------
  // Upcoming races
  // ---------------------------------------------------------------------------

  async getUpcoming(orgId: string, daysAhead: number = 14): Promise<any[]> {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() + daysAhead);

    return this.prisma.race.findMany({
      where: {
        orgId,
        raceDate: { gte: now, lte: cutoff },
        status: { in: ["SCHEDULED", "ENTRIES_OPEN", "ENTRIES_CLOSED"] },
      },
      include: {
        entries: {
          select: { id: true, horseId: true, status: true },
        },
      },
      orderBy: { raceDate: "asc" },
    });
  }

  // ---------------------------------------------------------------------------
  // Trip notes
  // ---------------------------------------------------------------------------

  async addTripNote(orgId: string, raceId: string, userId: string, input: TripNoteInput): Promise<any> {
    const race = await this.getById(orgId, raceId);

    return this.prisma.tripNote.create({
      data: {
        orgId,
        horseId: input.horseId,
        raceDate: race.raceDate,
        trackName: race.trackName,
        note: input.note,
        tags: input.tags ?? [],
        authorId: userId,
      },
    });
  }
}
