import type { PrismaClient, Prisma } from "@prisma/client";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../../config/constants.js";
import { NotFoundError, ValidationError } from "../../lib/errors.js";
import type {
  CreateChecklistInput,
  CreateFeedLogInput,
  CreateTherapyLogInput,
  CreateTaskInput,
  UpdateTaskInput,
  CreateOperationLogInput,
  UpdateStallInput,
  OperationsListQuery,
} from "./operations.schemas.js";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class OperationsService {
  constructor(private readonly prisma: PrismaClient) {}

  // ---------------------------------------------------------------------------
  // Checklist management (uses DailyChecklist + DailyChecklistItem)
  // ---------------------------------------------------------------------------

  async listChecklists(orgId: string, query: OperationsListQuery): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const where: Prisma.DailyChecklistWhereInput = {
      orgId,
    };

    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) (where.date as any).gte = query.dateFrom;
      if (query.dateTo) (where.date as any).lte = query.dateTo;
    }

    const [checklists, total] = await Promise.all([
      this.prisma.dailyChecklist.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
        include: { items: true, createdBy: { select: { firstName: true, lastName: true } } },
      }),
      this.prisma.dailyChecklist.count({ where }),
    ]);

    return {
      data: checklists,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createChecklist(
    orgId: string,
    createdById: string,
    input: CreateChecklistInput,
  ): Promise<any> {
    return this.prisma.dailyChecklist.create({
      data: {
        orgId,
        date: input.date,
        createdById,
        status: "IN_PROGRESS",
        items: {
          create: input.items.map((item) => ({
            horseId: item.horseId ?? null,
            description: item.description,
            sortOrder: item.sortOrder ?? 0,
          })),
        },
      },
      include: { items: true },
    });
  }

  async completeChecklistItem(
    orgId: string,
    checklistId: string,
    itemId: string,
    completedById: string,
    completedAt?: Date,
  ): Promise<any> {
    // Verify checklist exists in this org
    const checklist = await this.prisma.dailyChecklist.findFirst({
      where: { id: checklistId, orgId },
    });
    if (!checklist) {
      throw new NotFoundError("Checklist", checklistId);
    }

    const item = await this.prisma.dailyChecklistItem.findFirst({
      where: { id: itemId, checklistId },
    });
    if (!item) {
      throw new NotFoundError("Checklist item", itemId);
    }

    return this.prisma.dailyChecklistItem.update({
      where: { id: itemId },
      data: {
        isCompleted: true,
        completedById,
        completedAt: completedAt ?? new Date(),
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Feed logs
  // ---------------------------------------------------------------------------

  async listFeedLogs(orgId: string, query: OperationsListQuery): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const where: Prisma.FeedLogWhereInput = {
      orgId,
    };

    if (query.horseId) where.horseId = query.horseId;
    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) (where.date as any).gte = query.dateFrom;
      if (query.dateTo) (where.date as any).lte = query.dateTo;
    }

    const [logs, total] = await Promise.all([
      this.prisma.feedLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
        include: {
          horse: { select: { name: true } },
          loggedBy: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.feedLog.count({ where }),
    ]);

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createFeedLog(
    orgId: string,
    loggedById: string,
    input: CreateFeedLogInput,
  ): Promise<any> {
    return this.prisma.feedLog.create({
      data: {
        orgId,
        horseId: input.horseId,
        date: input.date,
        meal: input.meal,
        feedType: input.feedType,
        quantity: input.quantity,
        unit: input.unit,
        supplements: input.supplements ?? null,
        notes: input.notes ?? null,
        loggedById,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Therapy logs
  // ---------------------------------------------------------------------------

  async listTherapyLogs(orgId: string, query: OperationsListQuery): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const where: Prisma.TherapyLogWhereInput = {
      orgId,
    };

    if (query.horseId) where.horseId = query.horseId;
    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) (where.date as any).gte = query.dateFrom;
      if (query.dateTo) (where.date as any).lte = query.dateTo;
    }

    const [logs, total] = await Promise.all([
      this.prisma.therapyLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
        include: {
          horse: { select: { name: true } },
          loggedBy: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.therapyLog.count({ where }),
    ]);

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createTherapyLog(
    orgId: string,
    loggedById: string,
    input: CreateTherapyLogInput,
  ): Promise<any> {
    return this.prisma.therapyLog.create({
      data: {
        orgId,
        horseId: input.horseId,
        date: input.date,
        therapyType: input.therapyType,
        duration: input.duration ?? null,
        provider: input.provider ?? null,
        notes: input.notes ?? null,
        loggedById,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Task management (uses TaskAssignment)
  // ---------------------------------------------------------------------------

  async listTasks(orgId: string, query: OperationsListQuery): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const where: Prisma.TaskAssignmentWhereInput = {
      orgId,
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query.horseId) where.horseId = query.horseId;

    let orderBy: Prisma.TaskAssignmentOrderByWithRelationInput = { createdAt: "desc" };
    if (query.sort) {
      const [field, dir] = query.sort.split(":");
      if (field && (dir === "asc" || dir === "desc")) {
        orderBy = { [field]: dir };
      }
    }

    const [tasks, total] = await Promise.all([
      this.prisma.taskAssignment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          assignee: { select: { firstName: true, lastName: true } },
          horse: { select: { name: true } },
        },
      }),
      this.prisma.taskAssignment.count({ where }),
    ]);

    const data = tasks.map((t: any) => ({
      ...t,
      assigneeName: t.assignee
        ? `${t.assignee.firstName} ${t.assignee.lastName}`
        : null,
      horseName: t.horse?.name ?? null,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createTask(orgId: string, createdBy: string, input: CreateTaskInput): Promise<any> {
    return this.prisma.taskAssignment.create({
      data: {
        orgId,
        horseId: input.horseId ?? null,
        title: input.title,
        description: input.description ?? null,
        priority: input.priority,
        assigneeId: input.assigneeId,
        dueDate: input.dueDate ?? null,
        status: "PENDING",
      },
    });
  }

  async updateTask(orgId: string, taskId: string, userId: string, input: UpdateTaskInput): Promise<any> {
    const task = await this.prisma.taskAssignment.findFirst({
      where: { id: taskId, orgId },
    });
    if (!task) {
      throw new NotFoundError("Task", taskId);
    }

    const data: any = { ...input };

    // If marking as completed, set completion metadata
    if (input.status === "COMPLETED" && task.status !== "COMPLETED") {
      data.completedAt = new Date();
    }
    // If un-completing, clear completion metadata
    if (input.status && input.status !== "COMPLETED" && task.status === "COMPLETED") {
      data.completedAt = null;
    }

    return this.prisma.taskAssignment.update({
      where: { id: taskId },
      data,
    });
  }

  // ---------------------------------------------------------------------------
  // Operation log
  // ---------------------------------------------------------------------------

  async listOperationLogs(orgId: string, query: OperationsListQuery): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const where: Prisma.OperationLogWhereInput = {
      orgId,
    };

    if (query.search) {
      where.OR = [
        { category: { contains: query.search, mode: "insensitive" } },
        { content: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query.horseId) where.horseId = query.horseId;

    const [logs, total] = await Promise.all([
      this.prisma.operationLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { author: { select: { firstName: true, lastName: true } } },
      }),
      this.prisma.operationLog.count({ where }),
    ]);

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createOperationLog(
    orgId: string,
    authorId: string,
    input: CreateOperationLogInput,
  ): Promise<any> {
    return this.prisma.operationLog.create({
      data: {
        orgId,
        horseId: input.horseId ?? null,
        category: input.category,
        content: input.content,
        isPinned: input.isPinned ?? false,
        authorId,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Barn / stall management
  // ---------------------------------------------------------------------------

  async getBarnMap(orgId: string): Promise<any[]> {
    return this.prisma.barn.findMany({
      where: { orgId },
      include: {
        stalls: {
          include: {
            horses: { select: { id: true, name: true, status: true } },
          },
          orderBy: { number: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async updateStall(orgId: string, stallId: string, input: UpdateStallInput): Promise<any> {
    const stall = await this.prisma.stall.findFirst({
      where: { id: stallId, barn: { orgId } },
    });
    if (!stall) {
      throw new NotFoundError("Stall", stallId);
    }

    const data: any = {};
    if (input.status !== undefined) data.status = input.status;

    // If assigning a horse, also update the horse's currentStallId
    if (input.horseId) {
      await this.prisma.horse.update({
        where: { id: input.horseId },
        data: { currentStallId: stallId, currentBarnId: stall.barnId },
      });
      data.status = "OCCUPIED";
    } else if (input.horseId === null) {
      // Remove horse from stall -- find horses assigned to this stall
      await this.prisma.horse.updateMany({
        where: { currentStallId: stallId },
        data: { currentStallId: null },
      });
      if (!input.status) data.status = "AVAILABLE";
    }

    return this.prisma.stall.update({
      where: { id: stallId },
      data,
      include: {
        horses: { select: { id: true, name: true } },
      },
    });
  }
}
