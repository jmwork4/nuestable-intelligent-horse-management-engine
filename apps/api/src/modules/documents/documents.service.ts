import type { PrismaClient, Prisma } from "@prisma/client";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../../config/constants.js";
import { NotFoundError } from "../../lib/errors.js";
import type {
  CreateDocumentInput,
  UpdateDocumentInput,
  DocumentListQuery,
} from "./documents.schemas.js";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class DocumentService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(orgId: string, query: DocumentListQuery): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const where: Prisma.DocumentWhereInput = {
      orgId,
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query.category) where.category = query.category;
    if (query.status) where.status = query.status;
    if (query.horseId) where.horseId = query.horseId;
    if (query.expiringWithinDays) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + query.expiringWithinDays);
      where.expiresAt = { lte: cutoff, gte: new Date() };
    }

    let orderBy: Prisma.DocumentOrderByWithRelationInput = { createdAt: "desc" };
    if (query.sort) {
      const [field, dir] = query.sort.split(":");
      if (field && (dir === "asc" || dir === "desc")) {
        orderBy = { [field]: dir };
      }
    }

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          horse: { select: { name: true } },
          uploadedBy: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.document.count({ where }),
    ]);

    const now = new Date();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    const data = documents.map((d: any) => ({
      id: d.id,
      horseId: d.horseId,
      category: d.category,
      status: d.status,
      title: d.title,
      fileUrl: d.fileUrl,
      fileSize: d.fileSize,
      mimeType: d.mimeType,
      expiresAt: d.expiresAt,
      aiExtractedData: d.aiExtractedData,
      aiConfidence: d.aiConfidence,
      createdAt: d.createdAt,
      horseName: d.horse?.name ?? null,
      uploadedByName: d.uploadedBy
        ? `${d.uploadedBy.firstName} ${d.uploadedBy.lastName}`
        : "Unknown",
      isExpiringSoon:
        d.expiresAt != null &&
        new Date(d.expiresAt).getTime() - now.getTime() < thirtyDays &&
        new Date(d.expiresAt).getTime() > now.getTime(),
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(orgId: string, docId: string): Promise<any> {
    const doc = await this.prisma.document.findFirst({
      where: { id: docId, orgId },
      include: {
        horse: { select: { name: true } },
        uploadedBy: { select: { firstName: true, lastName: true } },
      },
    });
    if (!doc) {
      throw new NotFoundError("Document", docId);
    }
    return doc;
  }

  async create(
    orgId: string,
    uploadedById: string,
    input: CreateDocumentInput,
  ): Promise<any> {
    return this.prisma.document.create({
      data: {
        orgId,
        uploadedById,
        horseId: input.horseId ?? null,
        category: input.category,
        title: input.title,
        fileUrl: input.fileUrl,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        expiresAt: input.expiresAt ?? null,
        status: "PENDING",
      },
    });
  }

  async update(orgId: string, docId: string, input: UpdateDocumentInput): Promise<any> {
    await this.getById(orgId, docId);
    return this.prisma.document.update({
      where: { id: docId },
      data: input,
    });
  }

  async delete(orgId: string, docId: string): Promise<void> {
    await this.getById(orgId, docId);
    await this.prisma.document.delete({ where: { id: docId } });
  }

  /**
   * Handle file upload: create the document record and trigger AI processing.
   */
  async upload(
    orgId: string,
    uploadedById: string,
    fileUrl: string,
    mimeType: string,
    fileSize: number,
    meta: {
      horseId?: string;
      category: string;
      title: string;
      expiresAt?: Date;
    },
  ): Promise<any> {
    const doc = await this.prisma.document.create({
      data: {
        orgId,
        uploadedById,
        horseId: meta.horseId ?? null,
        category: meta.category as any,
        title: meta.title,
        fileUrl,
        mimeType,
        fileSize,
        expiresAt: meta.expiresAt ?? null,
        status: "PROCESSING",
      },
    });

    // Trigger AI processing asynchronously (fire-and-forget via queue)
    this.triggerAIProcessing(doc.id).catch(() => {
      // Silently handle -- the document remains in PROCESSING state
    });

    return doc;
  }

  private async triggerAIProcessing(documentId: string): Promise<void> {
    await this.prisma.document.update({
      where: { id: documentId },
      data: { status: "PROCESSING" },
    });
  }

  /**
   * Search documents by title.
   */
  async search(orgId: string, queryText: string): Promise<any[]> {
    return this.prisma.document.findMany({
      where: {
        orgId,
        OR: [
          { title: { contains: queryText, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  /**
   * Get documents that are expiring within the given number of days.
   */
  async getExpiring(orgId: string, daysAhead: number = 30): Promise<any[]> {
    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + daysAhead);

    return this.prisma.document.findMany({
      where: {
        orgId,
        expiresAt: { gte: now, lte: cutoff },
      },
      include: {
        horse: { select: { name: true } },
      },
      orderBy: { expiresAt: "asc" },
    });
  }
}
