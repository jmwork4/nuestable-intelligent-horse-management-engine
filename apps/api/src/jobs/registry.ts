import { Queue, Worker, type Processor, type WorkerOptions } from "bullmq";
import type Redis from "ioredis";
import { QUEUE_NAMES, DEFAULT_JOB_OPTIONS } from "../config/constants.js";
import { getLogger } from "../lib/logger.js";

const logger = getLogger();

export interface QueueRegistry {
  queues: Map<string, Queue>;
  workers: Map<string, Worker>;
  close: () => Promise<void>;
}

/**
 * Creates all BullMQ queues and registers workers.
 * Workers are not started until `registerWorker` is called for each queue.
 */
export function createQueueRegistry(connection: Redis): QueueRegistry {
  const queues = new Map<string, Queue>();
  const workers = new Map<string, Worker>();

  // Create queues for all named queues
  for (const queueName of Object.values(QUEUE_NAMES)) {
    const queue = new Queue(queueName, {
      connection: connection as any,
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    });

    queue.on("error", (err) => {
      logger.error({ queue: queueName, err }, "Queue error");
    });

    queues.set(queueName, queue);
    logger.info({ queue: queueName }, "Queue created");
  }

  async function close(): Promise<void> {
    logger.info("Shutting down job queues and workers");

    const workerClosePromises = Array.from(workers.values()).map((w) =>
      w.close(),
    );
    await Promise.all(workerClosePromises);

    const queueClosePromises = Array.from(queues.values()).map((q) =>
      q.close(),
    );
    await Promise.all(queueClosePromises);

    logger.info("All queues and workers closed");
  }

  return { queues, workers, close };
}

/**
 * Register a processor function for a named queue.
 */
export function registerWorker<T = unknown>(
  registry: QueueRegistry,
  queueName: string,
  processor: Processor<T>,
  connection: Redis,
  options?: Partial<WorkerOptions>,
): Worker<T> {
  const worker = new Worker<T>(queueName, processor, {
    connection: connection as any,
    concurrency: 5,
    limiter: {
      max: 50,
      duration: 60000,
    },
    ...options,
  });

  worker.on("completed", (job) => {
    logger.info(
      { queue: queueName, jobId: job?.id, jobName: job?.name },
      "Job completed",
    );
  });

  worker.on("failed", (job, err) => {
    logger.error(
      {
        queue: queueName,
        jobId: job?.id,
        jobName: job?.name,
        err,
        attemptsMade: job?.attemptsMade,
      },
      "Job failed",
    );
  });

  worker.on("error", (err) => {
    logger.error({ queue: queueName, err }, "Worker error");
  });

  registry.workers.set(queueName, worker);
  logger.info({ queue: queueName }, "Worker registered");

  return worker;
}

/**
 * Enqueue a job to a named queue.
 */
export async function enqueueJob<T = unknown>(
  registry: QueueRegistry,
  queueName: string,
  jobName: string,
  data: T,
  options?: {
    delay?: number;
    priority?: number;
    jobId?: string;
  },
): Promise<string> {
  const queue = registry.queues.get(queueName);
  if (!queue) {
    throw new Error(`Queue '${queueName}' not found in registry`);
  }

  const job = await queue.add(jobName, data, {
    ...DEFAULT_JOB_OPTIONS,
    ...options,
  });

  logger.info(
    { queue: queueName, jobId: job.id, jobName },
    "Job enqueued",
  );

  return job.id ?? "";
}
