import type { FastifyInstance } from "fastify";
import { NotificationService } from "./notifications.service.js";
import {
  notificationListQuerySchema,
  notificationIdParamSchema,
  bulkPreferencesSchema,
  type NotificationListQuery,
  type BulkPreferencesInput,
} from "./notifications.schemas.js";

export default async function notificationRoutes(app: FastifyInstance): Promise<void> {
  const service = new NotificationService(app.prisma);

  app.addHook("preHandler", app.authenticate);

  // ---- GET /notifications ----
  app.get<{ Querystring: NotificationListQuery }>(
    "/",
    { schema: { querystring: notificationListQuerySchema } },
    async (request, reply) => {
      const result = await service.list(
        request.user.id,
        request.user.orgId,
        request.query,
      );
      return reply.send(result);
    },
  );

  // ---- PATCH /notifications/:id/read ----
  app.patch<{ Params: { id: string } }>(
    "/:id/read",
    { schema: { params: notificationIdParamSchema } },
    async (request, reply) => {
      const notification = await service.markRead(
        request.user.id,
        request.user.orgId,
        request.params.id,
      );
      return reply.send(notification);
    },
  );

  // ---- POST /notifications/read-all ----
  app.post("/read-all", async (request, reply) => {
    const result = await service.markAllRead(request.user.id, request.user.orgId);
    return reply.send(result);
  });

  // ---- GET /notifications/unread-count ----
  app.get("/unread-count", async (request, reply) => {
    const result = await service.getUnreadCount(
      request.user.id,
      request.user.orgId,
    );
    return reply.send(result);
  });

  // ---- GET /notifications/preferences ----
  app.get("/preferences", async (request, reply) => {
    const prefs = await service.getPreferences(
      request.user.id,
      request.user.orgId,
    );
    return reply.send(prefs);
  });

  // ---- PUT /notifications/preferences ----
  app.put<{ Body: BulkPreferencesInput }>(
    "/preferences",
    { schema: { body: bulkPreferencesSchema } },
    async (request, reply) => {
      const prefs = await service.updatePreferences(
        request.user.id,
        request.user.orgId,
        request.body,
      );
      return reply.send(prefs);
    },
  );
}
