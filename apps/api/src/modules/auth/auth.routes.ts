import type { FastifyInstance, FastifyRequest } from "fastify";
import { AuthService } from "./auth.service.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  type RegisterInput,
  type LoginInput,
  type RefreshInput,
  type LogoutInput,
} from "./auth.schemas.js";

export default async function authRoutes(app: FastifyInstance): Promise<void> {
  const service = new AuthService(app.prisma);

  // ---- POST /register ----
  app.post<{ Body: RegisterInput }>(
    "/register",
    {
      schema: {
        body: registerSchema,
      },
    },
    async (request, reply) => {
      const tokens = await service.register(request.body);
      return reply.status(201).send(tokens);
    },
  );

  // ---- POST /login ----
  app.post<{ Body: LoginInput }>(
    "/login",
    {
      schema: {
        body: loginSchema,
      },
    },
    async (request, reply) => {
      const tokens = await service.login(request.body);
      return reply.send(tokens);
    },
  );

  // ---- POST /refresh ----
  app.post<{ Body: RefreshInput }>(
    "/refresh",
    {
      schema: {
        body: refreshSchema,
      },
    },
    async (request, reply) => {
      const tokens = await service.refresh(request.body);
      return reply.send(tokens);
    },
  );

  // ---- POST /logout ----
  app.post<{ Body: LogoutInput }>(
    "/logout",
    {
      schema: {
        body: logoutSchema,
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      await service.logout(request.user.id, request.body.refreshToken);
      return reply.status(204).send();
    },
  );

  // ---- GET /me ----
  app.get(
    "/me",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const me = await service.getMe(request.user.id, request.user.orgId);
      return reply.send(me);
    },
  );
}
