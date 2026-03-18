import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getEnv } from "../config/env.js";
import {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} from "../config/constants.js";

export interface JwtPayload {
  id: string;
  orgId: string;
  role: string;
  type: "access" | "refresh";
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authorize: (roles: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    signAccessToken: (payload: Omit<JwtPayload, "type">) => string;
    signRefreshToken: (payload: Omit<JwtPayload, "type">) => string;
  }
}

export default fp(
  async function authPlugin(fastify: FastifyInstance) {
    const env = getEnv();

    await fastify.register(fastifyJwt, {
      secret: env.JWT_SECRET,
      sign: {
        expiresIn: ACCESS_TOKEN_EXPIRY,
      },
    });

    fastify.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    });

    fastify.decorate("authorize", function (roles: string[]) {
      return async function (request: FastifyRequest, reply: FastifyReply) {
        if (!request.user || !roles.includes(request.user.role)) {
          return reply.status(403).send({
            error: {
              code: "FORBIDDEN",
              message: "Insufficient permissions",
            },
          });
        }
      };
    });

    fastify.decorate("signAccessToken", function (payload: Omit<JwtPayload, "type">): string {
      return fastify.jwt.sign(
        { ...payload, type: "access" as const },
        { expiresIn: ACCESS_TOKEN_EXPIRY },
      );
    });

    fastify.decorate("signRefreshToken", function (payload: Omit<JwtPayload, "type">): string {
      return fastify.jwt.sign(
        { ...payload, type: "refresh" as const },
        { expiresIn: REFRESH_TOKEN_EXPIRY },
      );
    });
  },
  {
    name: "auth",
  },
);
