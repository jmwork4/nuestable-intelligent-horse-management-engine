import type { FastifyInstance } from "fastify";
import { HealthService } from "./health.service.js";
import {
  createHealthRecordSchema,
  createMedicationSchema,
  createVaccinationSchema,
  createInjurySchema,
  updateInjurySchema,
  createLabResultSchema,
  healthListQuerySchema,
  horseIdParamSchema,
  idParamSchema,
  type CreateHealthRecordInput,
  type CreateMedicationInput,
  type CreateVaccinationInput,
  type CreateInjuryInput,
  type UpdateInjuryInput,
  type CreateLabResultInput,
  type HealthListQuery,
} from "./health.schemas.js";

export default async function healthRoutes(app: FastifyInstance): Promise<void> {
  const service = new HealthService(app.prisma);

  app.addHook("preHandler", app.authenticate);

  // =========================================================================
  // Health records (general)
  // =========================================================================

  // ---- GET /health/records ----
  app.get<{ Querystring: HealthListQuery }>(
    "/records",
    { schema: { querystring: healthListQuerySchema } },
    async (request, reply) => {
      const result = await service.listHealthRecords(request.user.orgId, request.query);
      return reply.send(result);
    },
  );

  // ---- POST /health/records ----
  app.post<{ Body: CreateHealthRecordInput }>(
    "/records",
    { schema: { body: createHealthRecordSchema } },
    async (request, reply) => {
      const record = await service.createHealthRecord(
        request.user.orgId,
        request.user.id,
        request.body,
      );
      return reply.status(201).send(record);
    },
  );

  // =========================================================================
  // Medications
  // =========================================================================

  // ---- GET /health/medications ----
  app.get<{ Querystring: HealthListQuery }>(
    "/medications",
    { schema: { querystring: healthListQuerySchema } },
    async (request, reply) => {
      const result = await service.listMedications(request.user.orgId, request.query);
      return reply.send(result);
    },
  );

  // ---- POST /health/medications ----
  app.post<{ Body: CreateMedicationInput }>(
    "/medications",
    { schema: { body: createMedicationSchema } },
    async (request, reply) => {
      const record = await service.createMedication(
        request.user.orgId,
        request.body,
      );
      return reply.status(201).send(record);
    },
  );

  // ---- GET /health/medications/withdrawals ----
  app.get("/medications/withdrawals", async (request, reply) => {
    const query = request.query as { horseId?: string };
    const withdrawals = await service.getWithdrawals(
      request.user.orgId,
      query.horseId,
    );
    return reply.send(withdrawals);
  });

  // =========================================================================
  // Vaccinations
  // =========================================================================

  // ---- GET /health/vaccinations ----
  app.get<{ Querystring: HealthListQuery }>(
    "/vaccinations",
    { schema: { querystring: healthListQuerySchema } },
    async (request, reply) => {
      const result = await service.listVaccinations(request.user.orgId, request.query);
      return reply.send(result);
    },
  );

  // ---- POST /health/vaccinations ----
  app.post<{ Body: CreateVaccinationInput }>(
    "/vaccinations",
    { schema: { body: createVaccinationSchema } },
    async (request, reply) => {
      const record = await service.createVaccination(
        request.user.orgId,
        request.body,
      );
      return reply.status(201).send(record);
    },
  );

  // ---- GET /health/vaccinations/due ----
  app.get("/vaccinations/due", async (request, reply) => {
    const query = request.query as { days?: string };
    const days = query.days ? parseInt(query.days, 10) : 30;
    const due = await service.getVaccinationsDue(request.user.orgId, days);
    return reply.send(due);
  });

  // =========================================================================
  // Injuries
  // =========================================================================

  // ---- GET /health/injuries ----
  app.get<{ Querystring: HealthListQuery }>(
    "/injuries",
    { schema: { querystring: healthListQuerySchema } },
    async (request, reply) => {
      const result = await service.listInjuries(request.user.orgId, request.query);
      return reply.send(result);
    },
  );

  // ---- POST /health/injuries ----
  app.post<{ Body: CreateInjuryInput }>(
    "/injuries",
    { schema: { body: createInjurySchema } },
    async (request, reply) => {
      const record = await service.createInjury(request.user.orgId, request.body);
      return reply.status(201).send(record);
    },
  );

  // ---- PATCH /health/injuries/:id ----
  app.patch<{ Params: { id: string }; Body: UpdateInjuryInput }>(
    "/injuries/:id",
    { schema: { params: idParamSchema, body: updateInjurySchema } },
    async (request, reply) => {
      const record = await service.updateInjury(
        request.user.orgId,
        request.params.id,
        request.body,
      );
      return reply.send(record);
    },
  );

  // =========================================================================
  // Lab results
  // =========================================================================

  // ---- GET /health/lab-results ----
  app.get<{ Querystring: HealthListQuery }>(
    "/lab-results",
    { schema: { querystring: healthListQuerySchema } },
    async (request, reply) => {
      const result = await service.listLabResults(request.user.orgId, request.query);
      return reply.send(result);
    },
  );

  // ---- POST /health/lab-results ----
  app.post<{ Body: CreateLabResultInput }>(
    "/lab-results",
    { schema: { body: createLabResultSchema } },
    async (request, reply) => {
      const record = await service.createLabResult(request.user.orgId, request.body);
      return reply.status(201).send(record);
    },
  );

  // =========================================================================
  // Pre-race clearance
  // =========================================================================

  // ---- GET /health/clearance/:horseId ----
  app.get<{ Params: { horseId: string } }>(
    "/clearance/:horseId",
    { schema: { params: horseIdParamSchema } },
    async (request, reply) => {
      const clearance = await service.getPreRaceClearance(
        request.user.orgId,
        request.params.horseId,
      );
      return reply.send(clearance);
    },
  );
}
