import type { Job } from "bullmq";
import type { FastifyInstance } from "fastify";
import { QUEUE_NAMES, SOCKET_EVENTS } from "../config/constants.js";
import { registerWorker, type QueueRegistry } from "./registry.js";
import { getLogger } from "../lib/logger.js";
import type Redis from "ioredis";

const logger = getLogger();

export interface NotificationJobData {
  type: "in_app" | "email" | "push";
  recipientUserId: string;
  recipientOrgId: string;
  title: string;
  body: string;
  category:
    | "race_update"
    | "vet_alert"
    | "training_reminder"
    | "document_ready"
    | "billing"
    | "system";
  metadata?: Record<string, unknown>;
  /** If true, also persist the notification to the database */
  persist?: boolean;
}

async function processNotification(
  job: Job<NotificationJobData>,
  fastify?: FastifyInstance,
): Promise<void> {
  const { type, recipientUserId, recipientOrgId, title, body, category, metadata, persist } =
    job.data;

  logger.info(
    {
      jobId: job.id,
      type,
      recipientUserId,
      category,
    },
    "Processing notification job",
  );

  switch (type) {
    case "in_app": {
      // Emit to the user's socket room
      if (fastify?.io) {
        const room = `org:${recipientOrgId}:user:${recipientUserId}`;
        fastify.io.to(room).emit(SOCKET_EVENTS.NOTIFICATION, {
          id: job.id,
          title,
          body,
          category,
          metadata,
          createdAt: new Date().toISOString(),
        });
        logger.info({ room, category }, "In-app notification emitted");
      }

      // Persist to database if requested
      if (persist && fastify?.prisma) {
        await fastify.prisma.$executeRawUnsafe(
          `INSERT INTO notifications (id, user_id, org_id, title, body, category, metadata, read, created_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, false, NOW())`,
          recipientUserId,
          recipientOrgId,
          title,
          body,
          category,
          JSON.stringify(metadata ?? {}),
        );
      }
      break;
    }

    case "email": {
      // In production, integrate with an email service (SendGrid, SES, etc.)
      logger.info(
        { recipientUserId, title, category },
        "Email notification dispatched (stub)",
      );
      break;
    }

    case "push": {
      // In production, integrate with FCM/APNS
      logger.info(
        { recipientUserId, title, category },
        "Push notification dispatched (stub)",
      );
      break;
    }
  }
}

/**
 * Registers the notification worker on the notifications queue.
 */
export function registerNotificationWorker(
  registry: QueueRegistry,
  connection: Redis,
  fastify?: FastifyInstance,
): void {
  registerWorker<NotificationJobData>(
    registry,
    QUEUE_NAMES.NOTIFICATIONS,
    (job) => processNotification(job, fastify),
    connection,
    { concurrency: 10 },
  );
}
