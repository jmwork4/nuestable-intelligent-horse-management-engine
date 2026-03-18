import type { FastifyInstance } from "fastify";
import { FinancialService } from "./financial.service.js";
import {
  createExpenseSchema,
  createRevenueSchema,
  createInvoiceSchema,
  updateInvoiceSchema,
  createPayoutSchema,
  financialListQuerySchema,
  costPerHorseQuerySchema,
  invoiceIdParamSchema,
  ownerIdParamSchema,
  type CreateExpenseInput,
  type CreateRevenueInput,
  type CreateInvoiceInput,
  type UpdateInvoiceInput,
  type CreatePayoutInput,
  type FinancialListQuery,
  type CostPerHorseQuery,
} from "./financial.schemas.js";

export default async function financialRoutes(app: FastifyInstance): Promise<void> {
  const service = new FinancialService(app.prisma);

  app.addHook("preHandler", app.authenticate);

  // =========================================================================
  // Expenses
  // =========================================================================

  // ---- GET /financial/expenses ----
  app.get<{ Querystring: FinancialListQuery }>(
    "/expenses",
    { schema: { querystring: financialListQuerySchema } },
    async (request, reply) => {
      const result = await service.listExpenses(request.user.orgId, request.query);
      return reply.send(result);
    },
  );

  // ---- POST /financial/expenses ----
  app.post<{ Body: CreateExpenseInput }>(
    "/expenses",
    { schema: { body: createExpenseSchema } },
    async (request, reply) => {
      const expense = await service.createExpense(
        request.user.orgId,
        request.user.id,
        request.body,
      );
      return reply.status(201).send(expense);
    },
  );

  // =========================================================================
  // Revenues
  // =========================================================================

  // ---- GET /financial/revenues ----
  app.get<{ Querystring: FinancialListQuery }>(
    "/revenues",
    { schema: { querystring: financialListQuerySchema } },
    async (request, reply) => {
      const result = await service.listRevenues(request.user.orgId, request.query);
      return reply.send(result);
    },
  );

  // ---- POST /financial/revenues ----
  app.post<{ Body: CreateRevenueInput }>(
    "/revenues",
    { schema: { body: createRevenueSchema } },
    async (request, reply) => {
      const revenue = await service.createRevenue(
        request.user.orgId,
        request.user.id,
        request.body,
      );
      return reply.status(201).send(revenue);
    },
  );

  // =========================================================================
  // Cost per horse
  // =========================================================================

  // ---- GET /financial/cost-per-horse ----
  app.get<{ Querystring: CostPerHorseQuery }>(
    "/cost-per-horse",
    { schema: { querystring: costPerHorseQuerySchema } },
    async (request, reply) => {
      const result = await service.getCostPerHorse(request.user.orgId, request.query);
      return reply.send(result);
    },
  );

  // =========================================================================
  // Invoices
  // =========================================================================

  // ---- GET /financial/invoices ----
  app.get<{ Querystring: FinancialListQuery }>(
    "/invoices",
    { schema: { querystring: financialListQuerySchema } },
    async (request, reply) => {
      const result = await service.listInvoices(request.user.orgId, request.query);
      return reply.send(result);
    },
  );

  // ---- POST /financial/invoices ----
  app.post<{ Body: CreateInvoiceInput }>(
    "/invoices",
    { schema: { body: createInvoiceSchema } },
    async (request, reply) => {
      const invoice = await service.createInvoice(
        request.user.orgId,
        request.user.id,
        request.body,
      );
      return reply.status(201).send(invoice);
    },
  );

  // ---- GET /financial/invoices/:id ----
  app.get<{ Params: { id: string } }>(
    "/invoices/:id",
    { schema: { params: invoiceIdParamSchema } },
    async (request, reply) => {
      const invoice = await service.getInvoiceById(
        request.user.orgId,
        request.params.id,
      );
      return reply.send(invoice);
    },
  );

  // ---- PATCH /financial/invoices/:id ----
  app.patch<{ Params: { id: string }; Body: UpdateInvoiceInput }>(
    "/invoices/:id",
    { schema: { params: invoiceIdParamSchema, body: updateInvoiceSchema } },
    async (request, reply) => {
      const invoice = await service.updateInvoice(
        request.user.orgId,
        request.params.id,
        request.body,
      );
      return reply.send(invoice);
    },
  );

  // ---- POST /financial/invoices/:id/send ----
  app.post<{ Params: { id: string } }>(
    "/invoices/:id/send",
    { schema: { params: invoiceIdParamSchema } },
    async (request, reply) => {
      const invoice = await service.sendInvoice(
        request.user.orgId,
        request.params.id,
      );
      return reply.send(invoice);
    },
  );

  // =========================================================================
  // Payouts
  // =========================================================================

  // ---- GET /financial/payouts ----
  app.get<{ Querystring: FinancialListQuery }>(
    "/payouts",
    { schema: { querystring: financialListQuerySchema } },
    async (request, reply) => {
      const result = await service.listPayouts(request.user.orgId, request.query);
      return reply.send(result);
    },
  );

  // ---- POST /financial/payouts ----
  app.post<{ Body: CreatePayoutInput }>(
    "/payouts",
    { schema: { body: createPayoutSchema } },
    async (request, reply) => {
      const payout = await service.createPayout(request.user.orgId, request.body);
      return reply.status(201).send(payout);
    },
  );

  // =========================================================================
  // Statements
  // =========================================================================

  // ---- GET /financial/statements/:ownerId ----
  app.get<{ Params: { ownerId: string }; Querystring: { dateFrom?: string; dateTo?: string } }>(
    "/statements/:ownerId",
    { schema: { params: ownerIdParamSchema } },
    async (request, reply) => {
      const dateFrom = request.query.dateFrom
        ? new Date(request.query.dateFrom)
        : undefined;
      const dateTo = request.query.dateTo
        ? new Date(request.query.dateTo)
        : undefined;

      const statement = await service.getOwnerStatement(
        request.user.orgId,
        request.params.ownerId,
        dateFrom,
        dateTo,
      );
      return reply.send(statement);
    },
  );
}
