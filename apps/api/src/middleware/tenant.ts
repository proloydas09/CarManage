import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/prisma";

/**
 * Verifies the requesting user actually belongs to the org they claim.
 * Must run AFTER authenticate middleware.
 */
export async function tenantGuard(req: FastifyRequest, reply: FastifyReply) {
  const membership = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId: req.orgId, userId: req.userId } },
    select: { role: true },
  });

  if (!membership) {
    return reply.status(403).send({ success: false, error: "Not a member of this organisation" });
  }

  // Keep role in sync (in case it changed)
  req.userRole = membership.role;
}
