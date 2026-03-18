import type { FastifyRequest, FastifyReply } from "fastify";
import { ForbiddenError, UnauthorizedError } from "../lib/errors.js";
import { ROLE_HIERARCHY } from "../config/constants.js";

type PreHandler = (
  request: FastifyRequest,
  reply: FastifyReply,
) => Promise<void>;

/**
 * Factory that returns a Fastify preHandler enforcing role-based access control.
 *
 * Usage:
 *   { preHandler: [authenticate, authorize(['ADMIN', 'TRAINER'])] }
 *
 * The handler checks that `request.user.role` is one of the allowed roles.
 * An optional `minLevel` mode can be enabled by passing a single role; any role
 * at or above that level in the hierarchy is permitted.
 */
export function authorize(allowedRoles: string[]): PreHandler {
  return async function authorizeHandler(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    if (!request.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const userRole = request.user.role;

    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenError(
        `Role '${userRole}' is not permitted for this action. Required: ${allowedRoles.join(", ")}`,
      );
    }
  };
}

/**
 * Factory that returns a preHandler allowing any role at or above the specified
 * minimum in the hierarchy.
 *
 * Usage:
 *   { preHandler: [authenticate, authorizeMinLevel('TRAINER')] }
 *
 * This would allow TRAINER, ADMIN, and OWNER but block GROOM and VIEWER.
 */
export function authorizeMinLevel(minRole: string): PreHandler {
  const minLevel = ROLE_HIERARCHY[minRole];
  if (minLevel === undefined) {
    throw new Error(`Unknown role '${minRole}' in ROLE_HIERARCHY`);
  }

  return async function authorizeMinLevelHandler(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    if (!request.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const userLevel = ROLE_HIERARCHY[request.user.role] ?? 0;

    if (userLevel < minLevel) {
      throw new ForbiddenError(
        `Minimum role level '${minRole}' required. Your role: '${request.user.role}'`,
      );
    }
  };
}
