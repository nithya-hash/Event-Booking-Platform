import pino from "pino";
import { env } from "./env";

// Detect Docker
const isDocker = process.env.DOCKER === "true";

export const logger = pino({
  level: env.nodeEnv === "production" ? "info" : "debug",

  transport:
    env.nodeEnv === "development" && !isDocker
      ? {
          target: "pino-pretty",
          options: { colorize: true },
        }
      : undefined,
});
