import fp from "fastify-plugin";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";

export default fp(
  async function swaggerPlugin(fastify: FastifyInstance) {
    await fastify.register(fastifySwagger, {
      openapi: {
        openapi: "3.1.0",
        info: {
          title: "Nuestable Horse Management API",
          description:
            "Intelligent horse racing management platform API. Manage horses, races, training, veterinary records, and more.",
          version: "1.0.0",
          contact: {
            name: "Nuestable Engineering",
          },
        },
        servers: [
          {
            url: "http://localhost:3000",
            description: "Local development",
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
              description: "JWT access token",
            },
          },
        },
        security: [{ bearerAuth: [] }],
        tags: [
          { name: "auth", description: "Authentication & authorization" },
          { name: "horses", description: "Horse management" },
          { name: "races", description: "Race data & entries" },
          { name: "training", description: "Training sessions & logs" },
          { name: "veterinary", description: "Veterinary records" },
          { name: "documents", description: "Document management & AI extraction" },
          { name: "organizations", description: "Organization & team management" },
          { name: "billing", description: "Subscription & payment management" },
        ],
      },
    });

    await fastify.register(fastifySwaggerUi, {
      routePrefix: "/docs",
      uiConfig: {
        docExpansion: "list",
        deepLinking: true,
        persistAuthorization: true,
      },
    });
  },
  {
    name: "swagger",
  },
);
