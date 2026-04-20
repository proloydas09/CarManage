import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { tenantGuard } from "../middleware/tenant";

const preHandler = [authenticate, tenantGuard];

export async function notificationRoutes(app: FastifyInstance) {
  // GET /notifications
  app.get("/", { preHandler }, async (req, reply) => {
    const { unreadOnly } = req.query as { unreadOnly?: string };

    const notifications = await prisma.notification.findMany({
      where: {
        orgId: req.orgId,
        ...(unreadOnly === "true" ? { isRead: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({ where: { orgId: req.orgId, isRead: false } });

    return reply.send({ success: true, data: notifications, unreadCount });
  });

  // PATCH /notifications/:id/read
  app.patch("/:id/read", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const n = await prisma.notification.findFirst({ where: { id, orgId: req.orgId } });
    if (!n) return reply.status(404).send({ success: false, error: "Notification not found" });

    await prisma.notification.update({ where: { id }, data: { isRead: true, readAt: new Date() } });
    return reply.send({ success: true });
  });

  // POST /notifications/read-all
  app.post("/read-all", { preHandler }, async (req, reply) => {
    await prisma.notification.updateMany({
      where: { orgId: req.orgId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return reply.send({ success: true });
  });
}
