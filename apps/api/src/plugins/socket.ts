import fp from "fastify-plugin";
import { Server } from "socket.io";
import type { FastifyInstance } from "fastify";
import { getEnv } from "../config/env.js";

declare module "fastify" {
  interface FastifyInstance {
    io: Server;
  }
}

export default fp(
  async function socketPlugin(fastify: FastifyInstance) {
    const env = getEnv();

    const io = new Server(fastify.server, {
      cors: {
        origin: env.CORS_ORIGIN,
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    io.use(async (socket, next) => {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      try {
        const payload = fastify.jwt.verify<{
          id: string;
          orgId: string;
          role: string;
          type: string;
        }>(token);

        if (payload.type !== "access") {
          return next(new Error("Invalid token type"));
        }

        socket.data.user = {
          id: payload.id,
          orgId: payload.orgId,
          role: payload.role,
        };

        return next();
      } catch {
        return next(new Error("Invalid or expired token"));
      }
    });

    io.on("connection", (socket) => {
      const user = socket.data.user as {
        id: string;
        orgId: string;
        role: string;
      };

      const orgRoom = `org:${user.orgId}`;
      const userRoom = `org:${user.orgId}:user:${user.id}`;

      void socket.join([orgRoom, userRoom]);

      fastify.log.info(
        { userId: user.id, orgId: user.orgId },
        "Socket connected",
      );

      socket.on("disconnect", (reason) => {
        fastify.log.info(
          { userId: user.id, reason },
          "Socket disconnected",
        );
      });
    });

    fastify.decorate("io", io);

    fastify.addHook("onClose", async () => {
      fastify.log.info("Closing Socket.io server");
      io.close();
    });
  },
  {
    name: "socket",
    dependencies: ["auth"],
  },
);
