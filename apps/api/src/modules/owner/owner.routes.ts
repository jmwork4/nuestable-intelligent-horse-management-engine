import type { FastifyInstance } from "fastify";
import { OwnerService } from "./owner.service.js";
import {
  ownerListQuerySchema,
  ownerHorseIdParamSchema,
  createMessageSchema,
  castVoteSchema,
  voteIdParamSchema,
  type OwnerListQuery,
  type CreateMessageInput,
  type CastVoteInput,
} from "./owner.schemas.js";

export default async function ownerRoutes(app: FastifyInstance): Promise<void> {
  const service = new OwnerService(app.prisma);

  // All owner routes require authentication + OWNER role
  app.addHook("preHandler", app.authenticate);
  app.addHook("preHandler", app.authorize(["OWNER", "ADMIN"]));

  // ---- GET /owner/horses ----
  app.get<{ Querystring: OwnerListQuery }>(
    "/horses",
    { schema: { querystring: ownerListQuerySchema } },
    async (request, reply) => {
      const result = await service.listHorses(
        request.user.id,
        request.user.orgId,
        request.query,
      );
      return reply.send(result);
    },
  );

  // ---- GET /owner/horses/:id ----
  app.get<{ Params: { id: string } }>(
    "/horses/:id",
    { schema: { params: ownerHorseIdParamSchema } },
    async (request, reply) => {
      const horse = await service.getHorseDetail(
        request.user.id,
        request.user.orgId,
        request.params.id,
      );
      return reply.send(horse);
    },
  );

  // ---- GET /owner/results ----
  app.get<{ Querystring: OwnerListQuery }>(
    "/results",
    { schema: { querystring: ownerListQuerySchema } },
    async (request, reply) => {
      const result = await service.listResults(
        request.user.id,
        request.user.orgId,
        request.query,
      );
      return reply.send(result);
    },
  );

  // ---- GET /owner/invoices ----
  app.get<{ Querystring: OwnerListQuery }>(
    "/invoices",
    { schema: { querystring: ownerListQuerySchema } },
    async (request, reply) => {
      const result = await service.listInvoices(
        request.user.id,
        request.user.orgId,
        request.query,
      );
      return reply.send(result);
    },
  );

  // ---- GET /owner/statements ----
  app.get(
    "/statements",
    async (request, reply) => {
      const query = request.query as { dateFrom?: string; dateTo?: string };
      const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
      const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;

      const statement = await service.getStatements(
        request.user.id,
        request.user.orgId,
        dateFrom,
        dateTo,
      );
      return reply.send(statement);
    },
  );

  // ---- GET /owner/messages ----
  app.get<{ Querystring: OwnerListQuery }>(
    "/messages",
    { schema: { querystring: ownerListQuerySchema } },
    async (request, reply) => {
      const result = await service.listMessages(
        request.user.id,
        request.user.orgId,
        request.query,
      );
      return reply.send(result);
    },
  );

  // ---- POST /owner/messages ----
  app.post<{ Body: CreateMessageInput }>(
    "/messages",
    { schema: { body: createMessageSchema } },
    async (request, reply) => {
      const message = await service.createMessage(
        request.user.id,
        request.user.orgId,
        request.body,
      );
      return reply.status(201).send(message);
    },
  );

  // ---- GET /owner/votes/:id ----
  app.get<{ Params: { id: string } }>(
    "/votes/:id",
    { schema: { params: voteIdParamSchema } },
    async (request, reply) => {
      const vote = await service.getVote(
        request.user.id,
        request.user.orgId,
        request.params.id,
      );
      return reply.send(vote);
    },
  );

  // ---- POST /owner/votes/:id ----
  app.post<{ Params: { id: string }; Body: CastVoteInput }>(
    "/votes/:id",
    { schema: { params: voteIdParamSchema, body: castVoteSchema } },
    async (request, reply) => {
      const response = await service.castVote(
        request.user.id,
        request.user.orgId,
        request.params.id,
        request.body,
      );
      return reply.status(201).send(response);
    },
  );
}
