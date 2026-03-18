import { getEnv } from "./config/env.js";
import { buildApp } from "./app.js";

async function main(): Promise<void> {
  const env = getEnv();
  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`Server listening on ${env.HOST}:${env.PORT}`);

    if (typeof app.swagger === "function") {
      app.log.info(`API docs available at http://${env.HOST}:${env.PORT}/docs`);
    }
  } catch (err) {
    app.log.fatal({ err }, "Failed to start server");
    process.exit(1);
  }

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, "Received shutdown signal");
    try {
      await app.close();
      app.log.info("Server shut down gracefully");
      process.exit(0);
    } catch (err) {
      app.log.error({ err }, "Error during shutdown");
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
