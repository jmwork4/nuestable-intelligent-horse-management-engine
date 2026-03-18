import type { PrismaClient, Prisma } from "@prisma/client";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../../config/constants.js";
import { NotFoundError, ForbiddenError } from "../../lib/errors.js";
import type {
  OwnerListQuery,
  CreateMessageInput,
  CastVoteInput,
} from "./owner.schemas.js";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class OwnerService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Get horse IDs owned by this user (via active ownership shares).
   */
  private async getOwnedHorseIds(userId: string, orgId: string): Promise<string[]> {
    const shares = await this.prisma.horseOwnership.findMany({
      where: {
        userId,
        endDate: null,
        horse: { orgId },
      },
      select: { horseId: true },
    });
    return shares.map((s) => s.horseId);
  }

  /**
   * Verify that the given horse is owned by the user.
   */
  private async assertOwnership(
    userId: string,
    orgId: string,
    horseId: string,
  ): Promise<void> {
    const share = await this.prisma.horseOwnership.findFirst({
      where: {
        userId,
        horseId,
        endDate: null,
        horse: { orgId },
      },
    });
    if (!share) {
      throw new ForbiddenError("You do not own this horse");
    }
  }

  // ---------------------------------------------------------------------------
  // Horses
  // ---------------------------------------------------------------------------

  async listHorses(
    userId: string,
    orgId: string,
    query: OwnerListQuery,
  ): Promise<PaginatedResult<any>> {
    const horseIds = await this.getOwnedHorseIds(userId, orgId);

    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const where: Prisma.HorseWhereInput = {
      id: { in: horseIds },
      orgId,
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { registeredName: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [horses, total] = await Promise.all([
      this.prisma.horse.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        include: {
          ownerships: { where: { endDate: null } },
        },
      }),
      this.prisma.horse.count({ where }),
    ]);

    return {
      data: horses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getHorseDetail(
    userId: string,
    orgId: string,
    horseId: string,
  ): Promise<any> {
    await this.assertOwnership(userId, orgId, horseId);

    const horse = await this.prisma.horse.findFirst({
      where: { id: horseId, orgId },
      include: {
        ownerships: { where: { endDate: null } },
        mediaItems: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });
    if (!horse) {
      throw new NotFoundError("Horse", horseId);
    }
    return horse;
  }

  // ---------------------------------------------------------------------------
  // Race results (for owned horses only)
  // ---------------------------------------------------------------------------

  async listResults(
    userId: string,
    orgId: string,
    query: OwnerListQuery,
  ): Promise<PaginatedResult<any>> {
    const horseIds = await this.getOwnedHorseIds(userId, orgId);

    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const where: Prisma.RaceEntryWhereInput = {
      horseId: { in: horseIds },
      status: "FINISHED",
      race: { orgId },
    };

    const [results, total] = await Promise.all([
      this.prisma.raceEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          race: {
            select: {
              trackName: true,
              raceDate: true,
              raceType: true,
              distance: true,
              surface: true,
              purse: true,
            },
          },
          horse: { select: { name: true } },
        },
      }),
      this.prisma.raceEntry.count({ where }),
    ]);

    return {
      data: results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ---------------------------------------------------------------------------
  // Invoices (for this owner)
  // ---------------------------------------------------------------------------

  async listInvoices(
    userId: string,
    orgId: string,
    query: OwnerListQuery,
  ): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {
      orgId,
      ownerId: userId,
    };

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ---------------------------------------------------------------------------
  // Statements (for this owner)
  // ---------------------------------------------------------------------------

  async getStatements(
    userId: string,
    orgId: string,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<any> {
    const periodStart = dateFrom ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const periodEnd = dateTo ?? new Date();

    const [payouts, invoices] = await Promise.all([
      this.prisma.payout.findMany({
        where: {
          orgId,
          ownerId: userId,
          date: { gte: periodStart, lte: periodEnd },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.invoice.findMany({
        where: {
          orgId,
          ownerId: userId,
          createdAt: { gte: periodStart, lte: periodEnd },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalPayouts = payouts.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalInvoiced = invoices.reduce((sum, i) => sum + Number(i.total), 0);

    return {
      periodStart,
      periodEnd,
      payouts,
      invoices,
      summary: {
        totalPayouts,
        totalInvoiced,
        balance: totalPayouts - totalInvoiced,
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Messages
  // ---------------------------------------------------------------------------

  async listMessages(
    userId: string,
    orgId: string,
    query: OwnerListQuery,
  ): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const where: Prisma.MessageWhereInput = {
      orgId,
      OR: [{ senderId: userId }, { recipientId: userId }],
    };

    if (query.search) {
      where.AND = [
        {
          OR: [
            { subject: { contains: query.search, mode: "insensitive" } },
            { body: { contains: query.search, mode: "insensitive" } },
          ],
        },
      ];
    }

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          sender: { select: { firstName: true, lastName: true } },
          recipient: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.message.count({ where }),
    ]);

    return {
      data: messages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createMessage(
    userId: string,
    orgId: string,
    input: CreateMessageInput,
  ): Promise<any> {
    return this.prisma.message.create({
      data: {
        orgId,
        senderId: userId,
        recipientId: input.recipientId ?? null,
        horseId: input.horseId ?? null,
        subject: input.subject,
        body: input.body,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Votes
  // ---------------------------------------------------------------------------

  async getVote(userId: string, orgId: string, voteId: string): Promise<any> {
    const vote = await this.prisma.syndicateVote.findFirst({
      where: { id: voteId, orgId },
      include: {
        entries: true,
      },
    });
    if (!vote) {
      throw new NotFoundError("Vote", voteId);
    }

    // Check that the user is an owner of the horse associated with this vote
    if (vote.horseId) {
      const share = await this.prisma.horseOwnership.findFirst({
        where: {
          userId,
          horseId: vote.horseId,
          endDate: null,
        },
      });
      if (!share) {
        throw new ForbiddenError("You are not an owner of the horse associated with this vote");
      }
    }

    return vote;
  }

  async castVote(
    userId: string,
    orgId: string,
    voteId: string,
    input: CastVoteInput,
  ): Promise<any> {
    // Verify vote exists and user has access
    await this.getVote(userId, orgId, voteId);

    // Check for duplicate vote
    const existing = await this.prisma.syndicateVoteEntry.findUnique({
      where: { voteId_userId: { voteId, userId } },
    });
    if (existing) {
      // Update existing vote
      return this.prisma.syndicateVoteEntry.update({
        where: { id: existing.id },
        data: {
          choice: input.choice,
        },
      });
    }

    return this.prisma.syndicateVoteEntry.create({
      data: {
        voteId,
        userId,
        choice: input.choice,
      },
    });
  }
}
