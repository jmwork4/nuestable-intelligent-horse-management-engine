import type { Job } from "bullmq";
import type { FastifyInstance } from "fastify";
import { QUEUE_NAMES, SOCKET_EVENTS } from "../config/constants.js";
import { registerWorker, enqueueJob, type QueueRegistry } from "./registry.js";
import { createDocumentAI } from "../external/anthropic/client.js";
import { getLogger } from "../lib/logger.js";
import type Redis from "ioredis";

const logger = getLogger();

export interface DocumentAIJobData {
  documentId: string;
  orgId: string;
  userId: string;
  documentBase64: string;
  mimeType: string;
  category?: string;
  horseId?: string;
}

async function processDocumentAI(
  job: Job<DocumentAIJobData>,
  fastify?: FastifyInstance,
  registry?: QueueRegistry,
): Promise<void> {
  const {
    documentId,
    orgId,
    userId,
    documentBase64,
    mimeType,
    category,
    horseId,
  } = job.data;

  logger.info(
    { jobId: job.id, documentId, category },
    "Processing document AI extraction",
  );

  const documentAI = createDocumentAI();

  await job.updateProgress(10);

  // Step 1: Extract structured data
  const extraction = await documentAI.extractDocument(
    documentBase64,
    mimeType,
    category,
  );

  await job.updateProgress(60);

  logger.info(
    {
      documentId,
      extractedCategory: extraction.category,
      confidence: extraction.confidence,
    },
    "Document extraction complete",
  );

  // Step 2: Persist extraction results to database
  if (fastify?.prisma) {
    await fastify.prisma.$executeRawUnsafe(
      `UPDATE documents SET
         extraction_status = 'completed',
         extracted_category = $1,
         extraction_confidence = $2,
         extracted_data = $3,
         extracted_summary = $4,
         extracted_raw_text = $5,
         processed_at = NOW()
       WHERE id = $6 AND org_id = $7`,
      extraction.category,
      extraction.confidence,
      JSON.stringify(extraction.structured),
      extraction.summary,
      extraction.rawText,
      documentId,
      orgId,
    );

    // Step 3: If the document is linked to a horse and is a vet record,
    // update the horse's last vet check date
    if (horseId && extraction.category === "VET_RECORD") {
      const examDate =
        (extraction.structured as Record<string, unknown>)["examDate"] as
          | string
          | undefined;
      if (examDate) {
        await fastify.prisma.$executeRawUnsafe(
          `UPDATE horses SET last_vet_check = $1 WHERE id = $2 AND org_id = $3`,
          examDate,
          horseId,
          orgId,
        );
      }
    }
  }

  await job.updateProgress(90);

  // Step 4: Notify the user that processing is complete
  if (fastify?.io) {
    const room = `org:${orgId}:user:${userId}`;
    fastify.io.to(room).emit(SOCKET_EVENTS.DOCUMENT_PROCESSED, {
      documentId,
      category: extraction.category,
      confidence: extraction.confidence,
      summary: extraction.summary,
    });
  }

  // Step 5: Also enqueue a persistent notification
  if (registry) {
    await enqueueJob(registry, QUEUE_NAMES.NOTIFICATIONS, "document-ready", {
      type: "in_app",
      recipientUserId: userId,
      recipientOrgId: orgId,
      title: "Document Processed",
      body: `Your ${extraction.category.replace(/_/g, " ").toLowerCase()} has been analyzed. ${extraction.summary}`,
      category: "document_ready",
      metadata: { documentId, extractedCategory: extraction.category },
      persist: true,
    });
  }

  await job.updateProgress(100);

  logger.info(
    { jobId: job.id, documentId },
    "Document AI job completed",
  );
}

/**
 * Registers the document AI worker on the document-ai queue.
 */
export function registerDocumentAIWorker(
  registry: QueueRegistry,
  connection: Redis,
  fastify?: FastifyInstance,
): void {
  registerWorker<DocumentAIJobData>(
    registry,
    QUEUE_NAMES.DOCUMENT_AI,
    (job) => processDocumentAI(job, fastify, registry),
    connection,
    { concurrency: 3 },
  );
}
