import pino from "pino";
import { getEnv } from "../config/env.js";

let loggerInstance: pino.Logger | null = null;

export function createLogger(): pino.Logger {
  if (loggerInstance) return loggerInstance;

  const env = getEnv();

  loggerInstance = pino({
    level: env.LOG_LEVEL,
    ...(env.NODE_ENV === "development" && {
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
          ignore: "pid,hostname",
        },
      },
    }),
    ...(env.NODE_ENV === "production" && {
      formatters: {
        level(label: string) {
          return { level: label };
        },
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    }),
    serializers: {
      req(request) {
        return {
          method: request.method,
          url: request.url,
          hostname: request.hostname,
          remoteAddress: request.ip,
        };
      },
      res(reply) {
        return {
          statusCode: reply.statusCode,
        };
      },
    },
  });

  return loggerInstance;
}

export function getLogger(): pino.Logger {
  return loggerInstance ?? createLogger();
}
