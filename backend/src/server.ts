import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { swaggerSpec } from "./config/swagger";
import { apiRouter } from "./routes";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

export const app = express();

app.disable("x-powered-by"); // don't advertise the framework
app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true, // allow the refresh-token cookie to be sent
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(pinoHttp({ logger }));

// Required for container orchestration / uptime checks (Section 10 & 13).
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/v1", apiRouter);

// Interactive API docs (Section 14 of the handbook) - visit /api-docs in a browser.
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (_req, res) => res.status(200).json(swaggerSpec));

app.use(notFoundHandler);
app.use(errorHandler); // must be registered last

// Only start listening when run directly (not when imported by tests).
if (require.main === module) {
  app.listen(env.port, () => {
    logger.info(`API listening on port ${env.port}`);
  });
}
