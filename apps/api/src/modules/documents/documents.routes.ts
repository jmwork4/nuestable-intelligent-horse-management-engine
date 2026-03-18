import type { FastifyInstance, FastifyRequest } from "fastify";
import type { MultipartFile } from "@fastify/multipart";
import { DocumentService } from "./documents.service.js";
import {
  createDocumentSchema,
  updateDocumentSchema,
  documentListQuerySchema,
  documentIdParamSchema,
  type CreateDocumentInput,
  type UpdateDocumentInput,
  type DocumentListQuery,
} from "./documents.schemas.js";

export default async function documentRoutes(app: FastifyInstance): Promise<void> {
  const service = new DocumentService(app.prisma);

  app.addHook("preHandler", app.authenticate);

  // ---- GET /documents ----
  app.get<{ Querystring: DocumentListQuery }>(
    "/",
    { schema: { querystring: documentListQuerySchema } },
    async (request, reply) => {
      const result = await service.list(request.user.orgId, request.query);
      return reply.send(result);
    },
  );

  // ---- POST /documents ----
  app.post<{ Body: CreateDocumentInput }>(
    "/",
    { schema: { body: createDocumentSchema } },
    async (request, reply) => {
      const doc = await service.create(
        request.user.orgId,
        request.user.id,
        request.body,
      );
      return reply.status(201).send(doc);
    },
  );

  // ---- POST /documents/upload ----
  app.post("/upload", async (request, reply) => {
    // Multipart upload -- expects a file part + JSON metadata
    const data = await (request as unknown as { file(): Promise<MultipartFile | undefined> }).file();
    if (!data) {
      return reply.status(400).send({ error: { code: "NO_FILE", message: "No file uploaded" } });
    }

    const chunks: Buffer[] = [];
    for await (const chunk of data.file) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Parse metadata fields from multipart form
    const fields = data.fields as Record<string, any>;
    const meta: Record<string, any> = {};
    for (const [key, field] of Object.entries(fields)) {
      if (field && typeof field === "object" && "value" in field) {
        meta[key] = (field as any).value;
      }
    }

    // In production, upload buffer to S3/GCS and get URL
    const fileUrl = `/uploads/${Date.now()}-${data.filename}`;

    const doc = await service.upload(
      request.user.orgId,
      request.user.id,
      fileUrl,
      data.mimetype,
      buffer.length,
      {
        horseId: meta.horseId,
        category: meta.category ?? "OTHER",
        title: meta.title ?? data.filename ?? "Untitled",
        expiresAt: meta.expiresAt ? new Date(meta.expiresAt) : undefined,
      },
    );

    return reply.status(201).send(doc);
  });

  // ---- GET /documents/expiring ----
  app.get("/expiring", async (request, reply) => {
    const query = request.query as { days?: string };
    const days = query.days ? parseInt(query.days, 10) : 30;
    const docs = await service.getExpiring(request.user.orgId, days);
    return reply.send(docs);
  });

  // ---- GET /documents/:id ----
  app.get<{ Params: { id: string } }>(
    "/:id",
    { schema: { params: documentIdParamSchema } },
    async (request, reply) => {
      const doc = await service.getById(request.user.orgId, request.params.id);
      return reply.send(doc);
    },
  );

  // ---- PATCH /documents/:id ----
  app.patch<{ Params: { id: string }; Body: UpdateDocumentInput }>(
    "/:id",
    { schema: { params: documentIdParamSchema, body: updateDocumentSchema } },
    async (request, reply) => {
      const doc = await service.update(
        request.user.orgId,
        request.params.id,
        request.body,
      );
      return reply.send(doc);
    },
  );

  // ---- DELETE /documents/:id ----
  app.delete<{ Params: { id: string } }>(
    "/:id",
    { schema: { params: documentIdParamSchema } },
    async (request, reply) => {
      await service.delete(request.user.orgId, request.params.id);
      return reply.status(204).send();
    },
  );
}
