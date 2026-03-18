import Fastify, { type FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";
import fastifySensible from "@fastify/sensible";
import fastifyHelmet from "@fastify/helmet";
import { getEnv } from "./config/env.js";
import { createLogger } from "./lib/logger.js";
import { AppError } from "./lib/errors.js";

// Plugins
import prismaPlugin from "./plugins/prisma.js";
import authPlugin from "./plugins/auth.js";
import redisPlugin from "./plugins/redis.js";
import socketPlugin from "./plugins/socket.js";
import swaggerPlugin from "./plugins/swagger.js";
import multitenancyPlugin from "./plugins/multitenancy.js";

// Route modules
import authRoutes from "./modules/auth/auth.routes.js";
import horseRoutes from "./modules/horses/horses.routes.js";
import raceRoutes from "./modules/races/races.routes.js";
import documentRoutes from "./modules/documents/documents.routes.js";
import operationsRoutes from "./modules/operations/operations.routes.js";
import healthRoutes from "./modules/health/health.routes.js";
import financialRoutes from "./modules/financial/financial.routes.js";
import ownerRoutes from "./modules/owner/owner.routes.js";
import notificationRoutes from "./modules/notifications/notifications.routes.js";

// Jobs
import { createQueueRegistry, type QueueRegistry } from "./jobs/registry.js";
import { registerNotificationWorker } from "./jobs/notification.worker.js";
import { registerDocumentAIWorker } from "./jobs/document-ai.worker.js";
import { registerRaceSyncWorker } from "./jobs/race-sync.worker.js";

export interface BuildAppOptions {
  /** Skip worker registration (useful for tests) */
  skipWorkers?: boolean;
}

export async function buildApp(
  options: BuildAppOptions = {},
): Promise<FastifyInstance> {
  const env = getEnv();
  const logger = createLogger();

  const app = Fastify({
    logger,
    trustProxy: true,
    ajv: {
      customOptions: {
        removeAdditional: "all",
        coerceTypes: true,
        useDefaults: true,
      },
    },
  });

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send(error.toJSON());
    }

    // Fastify validation errors
    if ((error as { validation?: unknown }).validation) {
      return reply.status(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: (error as { validation: unknown }).validation,
        },
      });
    }

    // JWT errors from @fastify/jwt
    if ((error as { statusCode?: number }).statusCode === 401) {
      return reply.status(401).send({
        error: {
          code: "UNAUTHORIZED",
          message: (error as Error).message || "Authentication required",
        },
      });
    }

    // Unexpected errors
    request.log.error({ err: error }, "Unhandled error");
    return reply.status(500).send({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message:
          env.NODE_ENV === "production"
            ? "An unexpected error occurred"
            : (error as Error).message,
      },
    });
  });

  // Not found handler
  app.setNotFoundHandler((_request, reply) => {
    return reply.status(404).send({
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
      },
    });
  });

  // Core plugins
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: env.NODE_ENV === "production",
  });
  await app.register(fastifyCors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });
  await app.register(fastifySensible);

  // Swagger (before routes)
  await app.register(swaggerPlugin);

  // Infrastructure plugins
  await app.register(prismaPlugin);
  await app.register(redisPlugin);
  await app.register(authPlugin);

  // Socket.io (depends on auth for JWT verification)
  await app.register(socketPlugin);

  // Multi-tenancy (depends on prisma + auth)
  await app.register(multitenancyPlugin);

  // Health check route
  app.get("/health", {
    schema: {
      tags: ["system"],
      description: "Health check endpoint",
      response: {
        200: {
          type: "object",
          properties: {
            status: { type: "string" },
            timestamp: { type: "string" },
            uptime: { type: "number" },
          },
        },
      },
    },
    handler: async () => {
      return {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      };
    },
  });

  // Register module routes
  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(horseRoutes, { prefix: "/api/horses" });
  await app.register(raceRoutes, { prefix: "/api/races" });
  await app.register(documentRoutes, { prefix: "/api/documents" });
  await app.register(operationsRoutes, { prefix: "/api/operations" });
  await app.register(healthRoutes, { prefix: "/api/health" });
  await app.register(financialRoutes, { prefix: "/api/financial" });
  await app.register(ownerRoutes, { prefix: "/api/owner" });
  await app.register(notificationRoutes, { prefix: "/api/notifications" });

  // Register background job workers
  if (!options.skipWorkers) {
    let registry: QueueRegistry | undefined;

    app.addHook("onReady", async () => {
      registry = createQueueRegistry(app.redis);
      registerNotificationWorker(registry, app.redis, app);
      registerDocumentAIWorker(registry, app.redis, app);
      registerRaceSyncWorker(registry, app.redis, app);
      app.log.info("Background job workers registered");
    });

    app.addHook("onClose", async () => {
      if (registry) {
        await registry.close();
      }
    });
  }

  return app;
}
