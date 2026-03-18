import type { PrismaClient, Prisma } from "@prisma/client";
import crypto from "node:crypto";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../../config/constants.js";
import { NotFoundError, ValidationError } from "../../lib/errors.js";
import type {
  CreateExpenseInput,
  CreateRevenueInput,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  CreatePayoutInput,
  FinancialListQuery,
  CostPerHorseQuery,
} from "./financial.schemas.js";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class FinancialService {
  constructor(private readonly prisma: PrismaClient) {}

  // ---------------------------------------------------------------------------
  // Expenses
  // ---------------------------------------------------------------------------

  async listExpenses(
    orgId: string,
    query: FinancialListQuery,
  ): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const where: Prisma.ExpenseWhereInput = { orgId };

    if (query.horseId) where.horseId = query.horseId;
    if (query.category) where.category = query.category as any;
    if (query.search) {
      where.OR = [
        { description: { contains: query.search, mode: "insensitive" } },
        { vendorName: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) (where.date as any).gte = query.dateFrom;
      if (query.dateTo) (where.date as any).lte = query.dateTo;
    }

    let orderBy: Prisma.ExpenseOrderByWithRelationInput = { date: "desc" };
    if (query.sort) {
      const [field, dir] = query.sort.split(":");
      if (field && (dir === "asc" || dir === "desc")) {
        orderBy = { [field]: dir };
      }
    }

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { horse: { select: { name: true } } },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      data: expenses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createExpense(
    orgId: string,
    createdBy: string,
    input: CreateExpenseInput,
  ): Promise<any> {
    return this.prisma.expense.create({
      data: {
        orgId,
        horseId: input.horseId ?? null,
        category: input.category,
        description: input.description,
        amount: input.amount,
        date: input.date,
        vendorName: input.vendorName ?? null,
        invoiceId: input.invoiceId ?? null,
        isRecurring: input.isRecurring ?? false,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Revenues
  // ---------------------------------------------------------------------------

  async listRevenues(
    orgId: string,
    query: FinancialListQuery,
  ): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const where: Prisma.RevenueWhereInput = { orgId };

    if (query.horseId) where.horseId = query.horseId;
    if (query.category) where.category = query.category as any;
    if (query.search) {
      where.OR = [
        { description: { contains: query.search, mode: "insensitive" } },
        { source: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) (where.date as any).gte = query.dateFrom;
      if (query.dateTo) (where.date as any).lte = query.dateTo;
    }

    let orderBy: Prisma.RevenueOrderByWithRelationInput = { date: "desc" };
    if (query.sort) {
      const [field, dir] = query.sort.split(":");
      if (field && (dir === "asc" || dir === "desc")) {
        orderBy = { [field]: dir };
      }
    }

    const [revenues, total] = await Promise.all([
      this.prisma.revenue.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { horse: { select: { name: true } } },
      }),
      this.prisma.revenue.count({ where }),
    ]);

    return {
      data: revenues,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createRevenue(
    orgId: string,
    createdBy: string,
    input: CreateRevenueInput,
  ): Promise<any> {
    return this.prisma.revenue.create({
      data: {
        orgId,
        horseId: input.horseId ?? null,
        category: input.category,
        description: input.description,
        amount: input.amount,
        date: input.date,
        source: input.source ?? null,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Cost per horse
  // ---------------------------------------------------------------------------

  async getCostPerHorse(
    orgId: string,
    query: CostPerHorseQuery,
  ): Promise<any[]> {
    const dateFrom = query.dateFrom ?? new Date(new Date().getFullYear(), 0, 1);
    const dateTo = query.dateTo ?? new Date();

    const horseWhere: Prisma.HorseWhereInput = { orgId };
    if (query.horseId) horseWhere.id = query.horseId;

    const horses = await this.prisma.horse.findMany({
      where: horseWhere,
      select: { id: true, name: true },
    });

    const results = await Promise.all(
      horses.map(async (horse) => {
        const [expenses, revenues] = await Promise.all([
          this.prisma.expense.findMany({
            where: {
              orgId,
              horseId: horse.id,
              date: { gte: dateFrom, lte: dateTo },
            },
          }),
          this.prisma.revenue.findMany({
            where: {
              orgId,
              horseId: horse.id,
              date: { gte: dateFrom, lte: dateTo },
            },
          }),
        ]);

        const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const totalRevenue = revenues.reduce((sum, r) => sum + Number(r.amount), 0);

        const expensesByCategory: Record<string, number> = {};
        for (const exp of expenses) {
          expensesByCategory[exp.category] =
            (expensesByCategory[exp.category] ?? 0) + Number(exp.amount);
        }

        return {
          horseId: horse.id,
          horseName: horse.name,
          periodStart: dateFrom,
          periodEnd: dateTo,
          totalExpenses,
          totalRevenue,
          net: totalRevenue - totalExpenses,
          expensesByCategory,
        };
      }),
    );

    return results;
  }

  // ---------------------------------------------------------------------------
  // Invoices
  // ---------------------------------------------------------------------------

  async listInvoices(
    orgId: string,
    query: FinancialListQuery,
  ): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = { orgId };

    if (query.search) {
      where.OR = [
        { invoiceNum: { contains: query.search, mode: "insensitive" } },
        { ownerName: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { payouts: true },
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

  async getInvoiceById(orgId: string, invoiceId: string): Promise<any> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, orgId },
      include: { payouts: true },
    });
    if (!invoice) {
      throw new NotFoundError("Invoice", invoiceId);
    }
    return invoice;
  }

  async createInvoice(
    orgId: string,
    createdBy: string,
    input: CreateInvoiceInput,
  ): Promise<any> {
    // Generate invoice number: INV-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const suffix = crypto.randomBytes(2).toString("hex").toUpperCase();
    const invoiceNum = `INV-${dateStr}-${suffix}`;

    return this.prisma.invoice.create({
      data: {
        orgId,
        invoiceNum,
        ownerId: input.ownerId ?? null,
        ownerName: input.ownerName,
        status: "DRAFT",
        subtotal: input.subtotal,
        tax: input.tax ?? 0,
        total: input.total,
        dueDate: input.dueDate ?? null,
        periodStart: input.periodStart ?? null,
        periodEnd: input.periodEnd ?? null,
        notes: input.notes ?? null,
      },
    });
  }

  async updateInvoice(
    orgId: string,
    invoiceId: string,
    input: UpdateInvoiceInput,
  ): Promise<any> {
    await this.getInvoiceById(orgId, invoiceId);
    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: input,
    });
  }

  /**
   * Mark an invoice as SENT.
   */
  async sendInvoice(orgId: string, invoiceId: string): Promise<any> {
    const invoice = await this.getInvoiceById(orgId, invoiceId);
    if (invoice.status !== "DRAFT") {
      throw new ValidationError(`Cannot send invoice in ${invoice.status} status`);
    }

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "SENT" },
    });
  }

  // ---------------------------------------------------------------------------
  // Payouts
  // ---------------------------------------------------------------------------

  async listPayouts(
    orgId: string,
    query: FinancialListQuery,
  ): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    const where: Prisma.PayoutWhereInput = { orgId };

    if (query.horseId) where.horseId = query.horseId;
    if (query.search) {
      where.OR = [
        { ownerName: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [payouts, total] = await Promise.all([
      this.prisma.payout.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.payout.count({ where }),
    ]);

    return {
      data: payouts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createPayout(
    orgId: string,
    input: CreatePayoutInput,
  ): Promise<any> {
    return this.prisma.payout.create({
      data: {
        orgId,
        invoiceId: input.invoiceId ?? null,
        ownerId: input.ownerId ?? null,
        ownerName: input.ownerName,
        horseId: input.horseId ?? null,
        amount: input.amount,
        type: input.type,
        date: input.date,
        notes: input.notes ?? null,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Owner statements
  // ---------------------------------------------------------------------------

  async getOwnerStatement(
    orgId: string,
    ownerId: string,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<any> {
    const periodStart = dateFrom ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const periodEnd = dateTo ?? new Date();

    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    if (!owner) {
      throw new NotFoundError("Owner", ownerId);
    }

    // Get the owner's horses (via ownership)
    const ownerShares = await this.prisma.horseOwnership.findMany({
      where: {
        userId: ownerId,
        horse: { orgId },
        endDate: null,
      },
      include: { horse: { select: { id: true, name: true } } },
    });

    const horseIds = ownerShares.map((s) => s.horseId);

    const [expenses, revenues, invoices, payouts] = await Promise.all([
      this.prisma.expense.findMany({
        where: {
          orgId,
          horseId: { in: horseIds },
          date: { gte: periodStart, lte: periodEnd },
        },
        include: { horse: { select: { name: true } } },
        orderBy: { date: "asc" },
      }),
      this.prisma.revenue.findMany({
        where: {
          orgId,
          horseId: { in: horseIds },
          date: { gte: periodStart, lte: periodEnd },
        },
        include: { horse: { select: { name: true } } },
        orderBy: { date: "asc" },
      }),
      this.prisma.invoice.findMany({
        where: {
          orgId,
          ownerId,
          createdAt: { gte: periodStart, lte: periodEnd },
        },
        orderBy: { createdAt: "asc" },
      }),
      this.prisma.payout.findMany({
        where: {
          orgId,
          ownerId,
          date: { gte: periodStart, lte: periodEnd },
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    // Calculate expenses proportional to ownership
    const proportionalExpenses = expenses.map((e: any) => {
      const share = ownerShares.find((s) => s.horseId === e.horseId);
      const percentage = share ? Number(share.ownershipPct) : 0;
      return {
        ...e,
        ownershipPercentage: percentage,
        ownerShare: Math.round(Number(e.amount) * percentage) / 100,
      };
    });

    const totalExpenses = proportionalExpenses.reduce(
      (sum, e) => sum + e.ownerShare,
      0,
    );
    const totalRevenue = revenues.reduce((sum, r) => sum + Number(r.amount), 0);
    const totalPayouts = payouts.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalInvoiced = invoices.reduce((sum, i) => sum + Number(i.total), 0);

    return {
      owner: {
        id: owner.id,
        name: `${owner.firstName} ${owner.lastName}`,
        email: owner.email,
      },
      periodStart,
      periodEnd,
      horses: ownerShares.map((s) => ({
        horseId: s.horseId,
        horseName: (s as any).horse.name,
        ownershipPct: Number(s.ownershipPct),
      })),
      expenses: proportionalExpenses,
      revenues,
      invoices,
      payouts,
      summary: {
        totalExpenses,
        totalRevenue,
        totalPayouts,
        totalInvoiced,
        net: totalRevenue + totalPayouts - totalExpenses,
      },
    };
  }
}
