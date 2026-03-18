import type { FastifyRequest, FastifyReply } from "fastify";
import { UnauthorizedError } from "../lib/errors.js";

/**
 * Fastify preHandler hook that verifies the JWT access token from the
 * Authorization header and attaches the decoded user to `request.user`.
 */
export async function authenticate(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  try {
    const decoded = await request.jwtVerify() as {
      id: string;
      orgId: string;
      role: string;
      type: string;
    };

    if (decoded.type !== "access") {
      throw new UnauthorizedError("Invalid token type");
    }

    request.user = {
      id: decoded.id,
      orgId: decoded.orgId,
      role: decoded.role,
      type: "access",
    };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      throw err;
    }
    throw new UnauthorizedError("Invalid or expired access token");
  }
}
