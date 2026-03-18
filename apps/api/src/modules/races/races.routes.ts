import type { FastifyInstance } from "fastify";
import { RaceService } from "./races.service.js";
import {
  createRaceSchema,
  updateRaceSchema,
  raceListQuerySchema,
  raceIdParamSchema,
  raceEntryParamSchema,
  createEntrySchema,
  updateEntrySchema,
  eligibilityParamSchema,
  tripNoteSchema,
  type CreateRaceInput,
  type UpdateRaceInput,
  type RaceListQuery,
  type CreateEntryInput,
  type UpdateEntryInput,
  type TripNoteInput,
} from "./races.schemas.js";

export default async function raceRoutes(app: FastifyInstance): Promise<void> {
  const service = new RaceService(app.prisma);

  app.addHook("preHandler", app.authenticate);

  // ---- GET /races ----
  app.get<{ Querystring: RaceListQuery }>(
    "/",
    { schema: { querystring: raceListQuerySchema } },
    async (request, reply) => {
      const result = await service.list(request.user.orgId, request.query);
      return reply.send(result);
    },
  );

  // ---- POST /races ----
  app.post<{ Body: CreateRaceInput }>(
    "/",
    { schema: { body: createRaceSchema } },
    async (request, reply) => {
      const race = await service.create(request.user.orgId, request.body);
      return reply.status(201).send(race);
    },
  );

  // ---- GET /races/dashboard ----
  app.get("/dashboard", async (request, reply) => {
    const dashboard = await service.getDashboard(request.user.orgId);
    return reply.send(dashboard);
  });

  // ---- GET /races/upcoming ----
  app.get("/upcoming", async (request, reply) => {
    const upcoming = await service.getUpcoming(request.user.orgId);
    return reply.send(upcoming);
  });

  // ---- GET /races/eligibility/:horseId ----
  app.get<{ Params: { horseId: string } }>(
    "/eligibility/:horseId",
    { schema: { params: eligibilityParamSchema } },
    async (request, reply) => {
      const matches = await service.checkEligibility(
        request.user.orgId,
        request.params.horseId,
      );
      return reply.send(matches);
    },
  );

  // ---- GET /races/:id ----
  app.get<{ Params: { id: string } }>(
    "/:id",
    { schema: { params: raceIdParamSchema } },
    async (request, reply) => {
      const race = await service.getById(request.user.orgId, request.params.id);
      return reply.send(race);
    },
  );

  // ---- PATCH /races/:id ----
  app.patch<{ Params: { id: string }; Body: UpdateRaceInput }>(
    "/:id",
    { schema: { params: raceIdParamSchema, body: updateRaceSchema } },
    async (request, reply) => {
      const race = await service.update(
        request.user.orgId,
        request.params.id,
        request.body,
      );
      return reply.send(race);
    },
  );

  // ---- POST /races/:id/entries ----
  app.post<{ Params: { id: string }; Body: CreateEntryInput }>(
    "/:id/entries",
    { schema: { params: raceIdParamSchema, body: createEntrySchema } },
    async (request, reply) => {
      const entry = await service.addEntry(
        request.user.orgId,
        request.params.id,
        request.body,
      );
      return reply.status(201).send(entry);
    },
  );

  // ---- PATCH /races/:id/entries/:entryId ----
  app.patch<{
    Params: { id: string; entryId: string };
    Body: UpdateEntryInput;
  }>(
    "/:id/entries/:entryId",
    { schema: { params: raceEntryParamSchema, body: updateEntrySchema } },
    async (request, reply) => {
      const entry = await service.updateEntry(
        request.user.orgId,
        request.params.id,
        request.params.entryId,
        request.body,
      );
      return reply.send(entry);
    },
  );

  // ---- POST /races/:id/trip-notes ----
  app.post<{ Params: { id: string }; Body: TripNoteInput }>(
    "/:id/trip-notes",
    { schema: { params: raceIdParamSchema, body: tripNoteSchema } },
    async (request, reply) => {
      const note = await service.addTripNote(
        request.user.orgId,
        request.params.id,
        request.user.id,
        request.body,
      );
      return reply.status(201).send(note);
    },
  );
}
