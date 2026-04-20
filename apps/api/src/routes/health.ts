import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { pingRedis } from "../lib/redis";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async (_req, reply) => {
    const [dbOk, redisOk] = await Promise.all([
      prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
      pingRedis(),
    ]);

    const status = dbOk && redisOk ? 200 : 503;
    return reply.status(status).send({
      status: status === 200 ? "ok" : "degraded",
      db: dbOk ? "up" : "down",
      redis: redisOk ? "up" : "down",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });
}
