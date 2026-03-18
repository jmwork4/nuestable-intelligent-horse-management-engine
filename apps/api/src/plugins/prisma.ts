import fp from "fastify-plugin";
import { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export default fp(
  async function prismaPlugin(fastify: FastifyInstance) {
    const prisma = new PrismaClient({
      log:
        fastify.log.level === "debug"
          ? [
              { emit: "event", level: "query" },
              { emit: "stdout", level: "info" },
              { emit: "stdout", level: "warn" },
              { emit: "stdout", level: "error" },
            ]
          : [
              { emit: "stdout", level: "warn" },
              { emit: "stdout", level: "error" },
            ],
    });

    await prisma.$connect();
    fastify.log.info("Prisma client connected");

    fastify.decorate("prisma", prisma);

    fastify.addHook("onClose", async () => {
      fastify.log.info("Disconnecting Prisma client");
      await prisma.$disconnect();
    });
  },
  {
    name: "prisma",
  },
);
