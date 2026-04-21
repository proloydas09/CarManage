import "dotenv/config";
(BigInt.prototype as any).toJSON = function () { return this.toString(); };
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { redis } from "./lib/redis";
import { healthRoutes } from "./routes/health";
import { authRoutes } from "./routes/auth";
import { carRoutes } from "./routes/cars";
import { costRoutes } from "./routes/costs";
import { earningRoutes } from "./routes/earnings";
import { driverRoutes } from "./routes/drivers";
import { bookingRoutes } from "./routes/bookings";
import { customerRoutes } from "./routes/customers";
import { notificationRoutes } from "./routes/notifications";
import { reportRoutes } from "./routes/reports";
import { orgRoutes } from "./routes/org";
import { startJobs } from "./jobs";

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === "production" ? "warn" : "info",
    transport: process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
  },
});

async function bootstrap() {
  // ── Plugins ────────────────────────────────────────────────────────────────
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"],
    credentials: true,
  });
  await app.register(rateLimit, {
    max: 150,
    timeWindow: "1 minute",
    redis,
    keyGenerator: (req) => {
      // Rate limit per org if authenticated, else per IP
      return (req as any).orgId ?? req.ip;
    },
  });

  // ── Routes ─────────────────────────────────────────────────────────────────
  app.get('/', async () => ({ success: true, message: 'Antigravity API running' }));
  await app.register(healthRoutes);
  await app.register(authRoutes, { prefix: "/auth" });

  // All API routes under /api/v1
  await app.register(async (v1) => {
    await v1.register(carRoutes, { prefix: "/cars" });
    await v1.register(costRoutes, { prefix: "/costs" });
    await v1.register(earningRoutes, { prefix: "/earnings" });
    await v1.register(driverRoutes, { prefix: "/drivers" });
    await v1.register(bookingRoutes, { prefix: "/bookings" });
    await v1.register(customerRoutes, { prefix: "/customers" });
    await v1.register(notificationRoutes, { prefix: "/notifications" });
    await v1.register(reportRoutes, { prefix: "/reports" });
    await v1.register(orgRoutes, { prefix: "/org" });
  }, { prefix: "/api/v1" });

  // ── Global error handler ───────────────────────────────────────────────────
  app.setErrorHandler((error: any, _req, reply) => {
    app.log.error(error);
    if (error.statusCode) {
      return reply.status(error.statusCode).send({ success: false, error: error.message });
    }
    return reply.status(500).send({ success: false, error: "Internal server error" });
  });

  app.setNotFoundHandler((_req, reply) => {
    reply.status(404).send({ success: false, error: "Route not found" });
  });

  // ── Start ──────────────────────────────────────────────────────────────────
  const port = parseInt(process.env.PORT ?? "4000", 10);
  const host = process.env.HOST ?? "0.0.0.0";

  await redis.connect();
  await app.listen({ port, host });
  console.log(app.printRoutes());
  console.log(`🚀 Antigravity API running on http://localhost:${port}`);

  // ── Background Jobs ────────────────────────────────────────────────────────
  await startJobs();
}

bootstrap().catch((err) => {
  console.error("Fatal error during startup:", err);
  process.exit(1);
});

// Triggering restart 1
