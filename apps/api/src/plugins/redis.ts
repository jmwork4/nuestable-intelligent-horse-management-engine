import fp from "fastify-plugin";
import Redis from "ioredis";
import type { FastifyInstance } from "fastify";
import { getEnv } from "../config/env.js";

declare module "fastify" {
  interface FastifyInstance {
    redis: Redis;
  }
}

export default fp(
  async function redisPlugin(fastify: FastifyInstance) {
    const env = getEnv();

    const redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      retryStrategy(times: number) {
        if (times > 10) {
          fastify.log.error("Redis: max retry attempts reached, giving up");
          return null;
        }
        const delay = Math.min(times * 200, 5000);
        return delay;
      },
      reconnectOnError(err: Error) {
        const targetErrors = ["READONLY", "ECONNRESET", "ETIMEDOUT"];
        return targetErrors.some((e) => err.message.includes(e));
      },
    });

    redis.on("connect", () => {
      fastify.log.info("Redis client connected");
    });

    redis.on("error", (err: Error) => {
      fastify.log.error({ err }, "Redis client error");
    });

    fastify.decorate("redis", redis);

    fastify.addHook("onClose", async () => {
      fastify.log.info("Disconnecting Redis client");
      await redis.quit();
    });
  },
  {
    name: "redis",
  },
);
