import fp from "fastify-plugin";
import type { FastifyInstance, FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    orgId: string | null;
  }
}

export default fp(
  async function multitenancyPlugin(fastify: FastifyInstance) {
    fastify.decorateRequest("orgId", null);

    fastify.addHook("preHandler", async (request: FastifyRequest) => {
      if (!request.user?.orgId) {
        return;
      }

      request.orgId = request.user.orgId;

      await fastify.prisma.$executeRawUnsafe(
        `SET LOCAL app.current_org_id = '${request.user.orgId}'`,
      );
    });
  },
  {
    name: "multitenancy",
    dependencies: ["prisma", "auth"],
  },
);
