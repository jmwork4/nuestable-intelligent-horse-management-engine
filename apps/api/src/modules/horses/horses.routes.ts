import type { FastifyInstance } from "fastify";
import { HorseService } from "./horses.service.js";
import {
  createHorseSchema,
  updateHorseSchema,
  horseListQuerySchema,
  horseIdParamSchema,
  addOwnershipSchema,
  addMediaSchema,
  type CreateHorseInput,
  type UpdateHorseInput,
  type HorseListQuery,
  type AddOwnershipInput,
  type AddMediaInput,
} from "./horses.schemas.js";

export default async function horseRoutes(app: FastifyInstance): Promise<void> {
  const service = new HorseService(app.prisma);

  // All routes require authentication
  app.addHook("preHandler", app.authenticate);

  // ---- GET /horses ----
  app.get<{ Querystring: HorseListQuery }>(
    "/",
    { schema: { querystring: horseListQuerySchema } },
    async (request, reply) => {
      const result = await service.list(request.user.orgId, request.query);
      return reply.send(result);
    },
  );

  // ---- POST /horses ----
  app.post<{ Body: CreateHorseInput }>(
    "/",
    { schema: { body: createHorseSchema } },
    async (request, reply) => {
      const horse = await service.create(
        request.user.orgId,
        request.user.id,
        request.body,
      );
      return reply.status(201).send(horse);
    },
  );

  // ---- GET /horses/:id ----
  app.get<{ Params: { id: string } }>(
    "/:id",
    { schema: { params: horseIdParamSchema } },
    async (request, reply) => {
      const horse = await service.getById(request.user.orgId, request.params.id);
      return reply.send(horse);
    },
  );

  // ---- PATCH /horses/:id ----
  app.patch<{ Params: { id: string }; Body: UpdateHorseInput }>(
    "/:id",
    { schema: { params: horseIdParamSchema, body: updateHorseSchema } },
    async (request, reply) => {
      const horse = await service.update(
        request.user.orgId,
        request.params.id,
        request.body,
      );
      return reply.send(horse);
    },
  );

  // ---- GET /horses/:id/ownerships ----
  app.get<{ Params: { id: string } }>(
    "/:id/ownerships",
    { schema: { params: horseIdParamSchema } },
    async (request, reply) => {
      const ownerships = await service.listOwnerships(
        request.user.orgId,
        request.params.id,
      );
      return reply.send(ownerships);
    },
  );

  // ---- POST /horses/:id/ownerships ----
  app.post<{ Params: { id: string }; Body: AddOwnershipInput }>(
    "/:id/ownerships",
    { schema: { params: horseIdParamSchema, body: addOwnershipSchema } },
    async (request, reply) => {
      const ownership = await service.addOwnership(
        request.user.orgId,
        request.params.id,
        request.body,
      );
      return reply.status(201).send(ownership);
    },
  );

  // ---- GET /horses/:id/media ----
  app.get<{ Params: { id: string } }>(
    "/:id/media",
    { schema: { params: horseIdParamSchema } },
    async (request, reply) => {
      const media = await service.listMedia(
        request.user.orgId,
        request.params.id,
      );
      return reply.send(media);
    },
  );

  // ---- POST /horses/:id/media ----
  app.post<{ Params: { id: string }; Body: AddMediaInput }>(
    "/:id/media",
    { schema: { params: horseIdParamSchema, body: addMediaSchema } },
    async (request, reply) => {
      const media = await service.addMedia(
        request.user.orgId,
        request.params.id,
        request.user.id,
        request.body,
      );
      return reply.status(201).send(media);
    },
  );

  // ---- GET /horses/:id/timeline ----
  app.get<{ Params: { id: string } }>(
    "/:id/timeline",
    { schema: { params: horseIdParamSchema } },
    async (request, reply) => {
      const timeline = await service.getTimeline(
        request.user.orgId,
        request.params.id,
      );
      return reply.send(timeline);
    },
  );

  // ---- GET /horses/:id/pedigree ----
  app.get<{ Params: { id: string } }>(
    "/:id/pedigree",
    { schema: { params: horseIdParamSchema } },
    async (request, reply) => {
      const horse = await service.getById(request.user.orgId, request.params.id);
      return reply.send({
        id: horse.id,
        name: horse.name,
        sireId: horse.sireId,
        damId: horse.damId,
        sireName: horse.sireName,
        damName: horse.damName,
      });
    },
  );
}
