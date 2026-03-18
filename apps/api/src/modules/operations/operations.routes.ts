import type { FastifyInstance } from "fastify";
import { OperationsService } from "./operations.service.js";
import {
  createChecklistSchema,
  completeChecklistItemSchema,
  createFeedLogSchema,
  createTherapyLogSchema,
  createTaskSchema,
  updateTaskSchema,
  createOperationLogSchema,
  updateStallSchema,
  operationsListQuerySchema,
  checklistIdParamSchema,
  checklistItemParamSchema,
  taskIdParamSchema,
  stallIdParamSchema,
  type CreateChecklistInput,
  type CompleteChecklistItemInput,
  type CreateFeedLogInput,
  type CreateTherapyLogInput,
  type CreateTaskInput,
  type UpdateTaskInput,
  type CreateOperationLogInput,
  type UpdateStallInput,
  type OperationsListQuery,
} from "./operations.schemas.js";

export default async function operationsRoutes(app: FastifyInstance): Promise<void> {
  const service = new OperationsService(app.prisma);

  app.addHook("preHandler", app.authenticate);

  // =========================================================================
  // Checklists
  // =========================================================================

  // ---- GET /operations/checklist ----
  app.get<{ Querystring: OperationsListQuery }>(
    "/checklist",
    { schema: { querystring: operationsListQuerySchema } },
    async (request, reply) => {
      const result = await service.listChecklists(request.user.orgId, request.query);
      return reply.send(result);
    },
  );

  // ---- POST /operations/checklist ----
  app.post<{ Body: CreateChecklistInput }>(
    "/checklist",
    { schema: { body: createChecklistSchema } },
    async (request, reply) => {
      const checklist = await service.createChecklist(
        request.user.orgId,
        request.user.id,
        request.body,
      );
      return reply.status(201).send(checklist);
    },
  );

  // ---- PATCH /operations/checklist/:id/items/:itemId ----
  app.patch<{
    Params: { id: string; itemId: string };
    Body: CompleteChecklistItemInput;
  }>(
    "/checklist/:id/items/:itemId",
    {
      schema: {
        params: checklistItemParamSchema,
        body: completeChecklistItemSchema,
      },
    },
    async (request, reply) => {
      const instance = await service.completeChecklistItem(
        request.user.orgId,
        request.params.id,
        request.params.itemId,
        request.user.id,
        request.body.completedAt,
      );
      return reply.send(instance);
    },
  );

  // =========================================================================
  // Feed logs
  // =========================================================================

  // ---- GET /operations/feed-logs ----
  app.get<{ Querystring: OperationsListQuery }>(
    "/feed-logs",
    { schema: { querystring: operationsListQuerySchema } },
    async (request, reply) => {
      const result = await service.listFeedLogs(request.user.orgId, request.query);
      return reply.send(result);
    },
  );

  // ---- POST /operations/feed-logs ----
  app.post<{ Body: CreateFeedLogInput }>(
    "/feed-logs",
    { schema: { body: createFeedLogSchema } },
    async (request, reply) => {
      const log = await service.createFeedLog(
        request.user.orgId,
        request.user.id,
        request.body,
      );
      return reply.status(201).send(log);
    },
  );

  // =========================================================================
  // Therapy logs
  // =========================================================================

  // ---- GET /operations/therapy-logs ----
  app.get<{ Querystring: OperationsListQuery }>(
    "/therapy-logs",
    { schema: { querystring: operationsListQuerySchema } },
    async (request, reply) => {
      const result = await service.listTherapyLogs(request.user.orgId, request.query);
      return reply.send(result);
    },
  );

  // ---- POST /operations/therapy-logs ----
  app.post<{ Body: CreateTherapyLogInput }>(
    "/therapy-logs",
    { schema: { body: createTherapyLogSchema } },
    async (request, reply) => {
      const log = await service.createTherapyLog(
        request.user.orgId,
        request.user.id,
        request.body,
      );
      return reply.status(201).send(log);
    },
  );

  // =========================================================================
  // Tasks
  // =========================================================================

  // ---- GET /operations/tasks ----
  app.get<{ Querystring: OperationsListQuery }>(
    "/tasks",
    { schema: { querystring: operationsListQuerySchema } },
    async (request, reply) => {
      const result = await service.listTasks(request.user.orgId, request.query);
      return reply.send(result);
    },
  );

  // ---- POST /operations/tasks ----
  app.post<{ Body: CreateTaskInput }>(
    "/tasks",
    { schema: { body: createTaskSchema } },
    async (request, reply) => {
      const task = await service.createTask(
        request.user.orgId,
        request.user.id,
        request.body,
      );
      return reply.status(201).send(task);
    },
  );

  // ---- PATCH /operations/tasks/:id ----
  app.patch<{ Params: { id: string }; Body: UpdateTaskInput }>(
    "/tasks/:id",
    { schema: { params: taskIdParamSchema, body: updateTaskSchema } },
    async (request, reply) => {
      const task = await service.updateTask(
        request.user.orgId,
        request.params.id,
        request.user.id,
        request.body,
      );
      return reply.send(task);
    },
  );

  // =========================================================================
  // Operation log
  // =========================================================================

  // ---- GET /operations/log ----
  app.get<{ Querystring: OperationsListQuery }>(
    "/log",
    { schema: { querystring: operationsListQuerySchema } },
    async (request, reply) => {
      const result = await service.listOperationLogs(request.user.orgId, request.query);
      return reply.send(result);
    },
  );

  // ---- POST /operations/log ----
  app.post<{ Body: CreateOperationLogInput }>(
    "/log",
    { schema: { body: createOperationLogSchema } },
    async (request, reply) => {
      const log = await service.createOperationLog(
        request.user.orgId,
        request.user.id,
        request.body,
      );
      return reply.status(201).send(log);
    },
  );

  // =========================================================================
  // Barn / stall management
  // =========================================================================

  // ---- GET /operations/barn-map ----
  app.get("/barn-map", async (request, reply) => {
    const barns = await service.getBarnMap(request.user.orgId);
    return reply.send(barns);
  });

  // ---- PATCH /operations/stalls/:id ----
  app.patch<{ Params: { id: string }; Body: UpdateStallInput }>(
    "/stalls/:id",
    { schema: { params: stallIdParamSchema, body: updateStallSchema } },
    async (request, reply) => {
      const stall = await service.updateStall(
        request.user.orgId,
        request.params.id,
        request.body,
      );
      return reply.send(stall);
    },
  );
}
