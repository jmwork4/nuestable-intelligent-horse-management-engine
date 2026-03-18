import type { FastifyRequest, FastifyReply } from "fastify";
import { UnauthorizedError } from "../lib/errors.js";

/**
 * Fastify preHandler that ensures the request has a valid org context from the
 * authenticated user's JWT and sets the PostgreSQL RLS session variable.
 *
 * This should be placed after `authenticate` in the preHandler chain.
 * It is complementary to the multitenancy plugin: the plugin sets the variable
 * globally on every authenticated request, while this middleware can be used
 * selectively on routes that strictly require org-scoped access.
 */
export async function tenancy(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  if (!request.user) {
    throw new UnauthorizedError("Authentication required");
  }

  const { orgId } = request.user;

  if (!orgId) {
    throw new UnauthorizedError(
      "Organization context required. User is not associated with an organization.",
    );
  }

  request.orgId = orgId;

  await request.server.prisma.$executeRawUnsafe(
    `SET LOCAL app.current_org_id = '${orgId}'`,
  );
}
