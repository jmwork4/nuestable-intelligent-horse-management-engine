import type { Job } from "bullmq";
import type { FastifyInstance } from "fastify";
import { QUEUE_NAMES, SOCKET_EVENTS } from "../config/constants.js";
import { registerWorker, type QueueRegistry } from "./registry.js";
import { createRacingApiClient } from "../external/racing-api/client.js";
import { getLogger } from "../lib/logger.js";
import type Redis from "ioredis";

const logger = getLogger();

export interface RaceSyncJobData {
  type: "sync_cards" | "sync_results" | "sync_all_tracks";
  trackCode?: string;
  date: string;
  orgId?: string;
}

async function processRaceSync(
  job: Job<RaceSyncJobData>,
  fastify?: FastifyInstance,
): Promise<void> {
  const { type, trackCode, date, orgId } = job.data;

  logger.info(
    { jobId: job.id, type, trackCode, date },
    "Processing race sync job",
  );

  const racingApi = createRacingApiClient();

  switch (type) {
    case "sync_cards": {
      if (!trackCode) {
        throw new Error("trackCode is required for sync_cards");
      }

      const cards = await racingApi.getRaceCards(trackCode, date);
      await job.updateProgress(50);

      if (fastify?.prisma) {
        for (const card of cards) {
          // Upsert race card data
          await fastify.prisma.$executeRawUnsafe(
            `INSERT INTO external_race_cards (
               external_id, track_name, track_code, race_number, race_type,
               surface, distance, purse, post_time, conditions, entries_json,
               sync_date, created_at, updated_at
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
             ON CONFLICT (external_id) DO UPDATE SET
               entries_json = EXCLUDED.entries_json,
               post_time = EXCLUDED.post_time,
               conditions = EXCLUDED.conditions,
               updated_at = NOW()`,
            card.id,
            card.trackName,
            card.trackCode,
            card.raceNumber,
            card.raceType,
            card.surface,
            card.distance,
            card.purse,
            card.postTime,
            card.conditions,
            JSON.stringify(card.entries),
            date,
          );
        }
      }

      logger.info(
        { trackCode, date, raceCount: cards.length },
        "Race cards synced",
      );

      // Notify org if provided
      if (fastify?.io && orgId) {
        fastify.io.to(`org:${orgId}`).emit(SOCKET_EVENTS.RACE_UPDATE, {
          type: "cards_synced",
          trackCode,
          date,
          raceCount: cards.length,
        });
      }

      break;
    }

    case "sync_results": {
      if (!trackCode) {
        throw new Error("trackCode is required for sync_results");
      }

      const results = await racingApi.getRaceResults(trackCode, date);
      await job.updateProgress(50);

      if (fastify?.prisma) {
        for (const result of results) {
          await fastify.prisma.$executeRawUnsafe(
            `INSERT INTO external_race_results (
               external_id, track_name, track_code, race_number, race_date,
               surface, distance, finish_order_json, fractional_times_json,
               final_time, track_condition, created_at, updated_at
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
             ON CONFLICT (external_id) DO UPDATE SET
               finish_order_json = EXCLUDED.finish_order_json,
               final_time = EXCLUDED.final_time,
               track_condition = EXCLUDED.track_condition,
               updated_at = NOW()`,
            result.raceId,
            result.trackName,
            result.trackCode,
            result.raceNumber,
            result.date,
            result.surface,
            result.distance,
            JSON.stringify(result.finishOrder),
            JSON.stringify(result.fractionalTimes),
            result.finalTime,
            result.trackCondition,
          );
        }

        // Cross-reference results with horses in the system to update records
        for (const result of results) {
          for (const finish of result.finishOrder) {
            await fastify.prisma.$executeRawUnsafe(
              `UPDATE horse_race_entries SET
                 finish_position = $1,
                 official_time = $2,
                 odds = $3,
                 synced_at = NOW()
               WHERE external_race_id = $4
                 AND horse_name_normalized = LOWER(TRIM($5))`,
              finish.position,
              finish.officialTime,
              finish.odds,
              result.raceId,
              finish.horseName,
            );
          }
        }
      }

      logger.info(
        { trackCode, date, resultCount: results.length },
        "Race results synced",
      );

      if (fastify?.io && orgId) {
        fastify.io.to(`org:${orgId}`).emit(SOCKET_EVENTS.RACE_UPDATE, {
          type: "results_synced",
          trackCode,
          date,
          resultCount: results.length,
        });
      }

      break;
    }

    case "sync_all_tracks": {
      const tracks = await racingApi.getTracks();
      await job.updateProgress(10);

      const totalTracks = tracks.length;
      let processed = 0;

      for (const track of tracks) {
        try {
          const cards = await racingApi.getRaceCards(track.code, date);
          const results = await racingApi.getRaceResults(track.code, date);

          logger.info(
            {
              trackCode: track.code,
              cards: cards.length,
              results: results.length,
            },
            "Track data synced",
          );

          if (fastify?.prisma) {
            for (const card of cards) {
              await fastify.prisma.$executeRawUnsafe(
                `INSERT INTO external_race_cards (
                   external_id, track_name, track_code, race_number, race_type,
                   surface, distance, purse, post_time, conditions, entries_json,
                   sync_date, created_at, updated_at
                 )
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
                 ON CONFLICT (external_id) DO UPDATE SET
                   entries_json = EXCLUDED.entries_json,
                   updated_at = NOW()`,
                card.id,
                card.trackName,
                card.trackCode,
                card.raceNumber,
                card.raceType,
                card.surface,
                card.distance,
                card.purse,
                card.postTime,
                card.conditions,
                JSON.stringify(card.entries),
                date,
              );
            }
          }
        } catch (err) {
          logger.error(
            { trackCode: track.code, err },
            "Failed to sync track data",
          );
        }

        processed++;
        const progress = 10 + Math.floor((processed / totalTracks) * 90);
        await job.updateProgress(progress);
      }

      logger.info(
        { date, trackCount: tracks.length },
        "All tracks synced",
      );
      break;
    }
  }

  await job.updateProgress(100);
}

/**
 * Registers the race sync worker on the race-sync queue.
 */
export function registerRaceSyncWorker(
  registry: QueueRegistry,
  connection: Redis,
  fastify?: FastifyInstance,
): void {
  registerWorker<RaceSyncJobData>(
    registry,
    QUEUE_NAMES.RACE_SYNC,
    (job) => processRaceSync(job, fastify),
    connection,
    { concurrency: 2 },
  );
}
