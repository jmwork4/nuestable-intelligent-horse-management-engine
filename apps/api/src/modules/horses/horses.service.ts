import type { PrismaClient, Prisma } from "@prisma/client";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../../config/constants.js";
import { NotFoundError, ValidationError } from "../../lib/errors.js";
import type {
  CreateHorseInput,
  UpdateHorseInput,
  AddOwnershipInput,
  AddMediaInput,
  HorseListQuery,
} from "./horses.schemas.js";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class HorseService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(orgId: string, query: HorseListQuery): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const where: Prisma.HorseWhereInput = {
      orgId,
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { registeredName: { contains: query.search, mode: "insensitive" } },
        { tattooNumber: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query.status) where.status = query.status;
    if (query.sex) where.sex = query.sex;
    if (query.barnId) where.currentBarnId = query.barnId;

    let orderBy: Prisma.HorseOrderByWithRelationInput = { name: "asc" };
    if (query.sort) {
      const [field, dir] = query.sort.split(":");
      if (field && (dir === "asc" || dir === "desc")) {
        orderBy = { [field]: dir };
      }
    }

    const [horses, total] = await Promise.all([
      this.prisma.horse.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          ownerships: {
            where: { endDate: null },
            select: { ownerName: true },
          },
          raceEntries: {
            where: {
              race: { raceDate: { gte: new Date() } },
              status: { in: ["ENTERED", "CONFIRMED"] },
            },
            take: 1,
            orderBy: { race: { raceDate: "asc" } },
            include: { race: { select: { raceDate: true, trackName: true } } },
          },
        },
      }),
      this.prisma.horse.count({ where }),
    ]);

    const data = horses.map((h: any) => ({
      id: h.id,
      name: h.name,
      sex: h.sex,
      status: h.status,
      profileImageUrl: h.profileImageUrl,
      currentBarnId: h.currentBarnId,
      currentStallId: h.currentStallId,
      ownerNames: h.ownerships.map((o: any) => o.ownerName),
      nextRaceDate: h.raceEntries[0]?.race?.raceDate ?? null,
      nextRaceName: h.raceEntries[0]?.race?.trackName ?? null,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(orgId: string, horseId: string): Promise<any> {
    const horse = await this.prisma.horse.findFirst({
      where: { id: horseId, orgId },
      include: {
        ownerships: true,
        mediaItems: true,
      },
    });
    if (!horse) {
      throw new NotFoundError("Horse", horseId);
    }
    return horse;
  }

  async create(orgId: string, createdBy: string, input: CreateHorseInput): Promise<any> {
    const { ownerships, ...horseData } = input;

    if (ownerships && ownerships.length > 0) {
      const totalPct = ownerships.reduce((sum, s) => sum + s.ownershipPct, 0);
      if (Math.abs(totalPct - 100) > 0.01) {
        throw new ValidationError("Ownership shares must sum to 100%");
      }
    }

    const horse = await this.prisma.horse.create({
      data: {
        ...horseData,
        orgId,
        ownerships: ownerships
          ? {
              create: ownerships.map((s) => ({
                orgId,
                userId: s.userId,
                ownerName: s.ownerName,
                ownershipPct: s.ownershipPct,
                startDate: s.startDate,
                endDate: s.endDate ?? null,
              })),
            }
          : undefined,
      },
      include: { ownerships: true },
    });

    return horse;
  }

  async update(orgId: string, horseId: string, input: UpdateHorseInput): Promise<any> {
    await this.getById(orgId, horseId); // throws if not found

    const { ownerships, ...horseData } = input;

    const horse = await this.prisma.horse.update({
      where: { id: horseId },
      data: {
        ...horseData,
      },
      include: { ownerships: true },
    });

    return horse;
  }

  // ---------------------------------------------------------------------------
  // Ownership management
  // ---------------------------------------------------------------------------

  async listOwnerships(orgId: string, horseId: string): Promise<any[]> {
    await this.getById(orgId, horseId);
    return this.prisma.horseOwnership.findMany({
      where: { horseId },
      orderBy: { startDate: "desc" },
    });
  }

  async addOwnership(
    orgId: string,
    horseId: string,
    input: AddOwnershipInput,
  ): Promise<any> {
    await this.getById(orgId, horseId);

    // Validate total percentage with existing shares
    const existing = await this.prisma.horseOwnership.findMany({
      where: { horseId, endDate: null },
    });
    const currentTotal = existing.reduce((sum, s) => sum + Number(s.ownershipPct), 0);
    if (currentTotal + input.ownershipPct > 100.01) {
      throw new ValidationError(
        `Adding ${input.ownershipPct}% would exceed 100% (current: ${currentTotal}%)`,
      );
    }

    return this.prisma.horseOwnership.create({
      data: {
        orgId,
        horseId,
        userId: input.userId,
        ownerName: input.ownerName,
        ownershipPct: input.ownershipPct,
        startDate: input.startDate,
        endDate: input.endDate ?? null,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Media management
  // ---------------------------------------------------------------------------

  async listMedia(orgId: string, horseId: string): Promise<any[]> {
    await this.getById(orgId, horseId);
    return this.prisma.mediaItem.findMany({
      where: { horseId },
      orderBy: { createdAt: "desc" },
    });
  }

  async addMedia(
    orgId: string,
    horseId: string,
    uploadedBy: string,
    input: AddMediaInput,
  ): Promise<any> {
    await this.getById(orgId, horseId);
    return this.prisma.mediaItem.create({
      data: {
        orgId,
        horseId,
        url: input.url,
        type: input.type,
        caption: input.caption ?? null,
        takenAt: input.takenAt ?? null,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Timeline aggregation
  // ---------------------------------------------------------------------------

  async getTimeline(orgId: string, horseId: string): Promise<any[]> {
    await this.getById(orgId, horseId);

    const [raceEntries, medications, injuries, therapies, documents] =
      await Promise.all([
        this.prisma.raceEntry.findMany({
          where: { horseId },
          include: { race: { select: { raceDate: true, trackName: true, raceClass: true } } },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        this.prisma.medicationLog.findMany({
          where: { horseId },
          orderBy: { administeredAt: "desc" },
          take: 50,
        }),
        this.prisma.injury.findMany({
          where: { horseId },
          orderBy: { dateOccurred: "desc" },
          take: 50,
        }),
        this.prisma.therapyLog.findMany({
          where: { horseId },
          orderBy: { date: "desc" },
          take: 50,
        }),
        this.prisma.document.findMany({
          where: { horseId },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
      ]);

    const events: any[] = [];

    for (const entry of raceEntries) {
      events.push({
        type: "RACE",
        date: (entry as any).race?.raceDate ?? entry.createdAt,
        title: `Race at ${(entry as any).race?.trackName ?? "Unknown"}`,
        details: { entryId: entry.id, status: entry.status, raceClass: (entry as any).race?.raceClass },
      });
    }

    for (const med of medications) {
      events.push({
        type: "MEDICATION",
        date: med.administeredAt,
        title: `${med.medicationName} administered`,
        details: { id: med.id, dosage: med.dosage, route: med.route },
      });
    }

    for (const injury of injuries) {
      events.push({
        type: "INJURY",
        date: injury.dateOccurred,
        title: `Injury: ${injury.description}`,
        details: { id: injury.id, severity: injury.severity, status: injury.status },
      });
    }

    for (const therapy of therapies) {
      events.push({
        type: "THERAPY",
        date: therapy.date,
        title: `${therapy.therapyType} therapy`,
        details: { id: therapy.id, duration: therapy.duration },
      });
    }

    for (const doc of documents) {
      events.push({
        type: "DOCUMENT",
        date: doc.createdAt,
        title: `Document: ${doc.title}`,
        details: { id: doc.id, category: doc.category, status: doc.status },
      });
    }

    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return events;
  }
}
