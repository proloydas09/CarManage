import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { tenantGuard } from "../middleware/tenant";
import { UpdateOrgSchema, InviteUserSchema } from "@antigravity/types";
import { addDays } from "date-fns";

const preHandler = [authenticate, tenantGuard];

export async function orgRoutes(app: FastifyInstance) {
  // GET /org — get current org details
  app.get("/", { preHandler }, async (req, reply) => {
    const org = await prisma.organisation.findUnique({
      where: { id: req.orgId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        },
      },
    });
    if (!org) return reply.status(404).send({ success: false, error: "Organisation not found" });
    return reply.send({ success: true, data: org });
  });

  // PATCH /org — update org settings (ADMIN+)
  app.patch("/", { preHandler }, async (req, reply) => {
    if (!["OWNER", "ADMIN"].includes(req.userRole)) {
      return reply.status(403).send({ success: false, error: "Admin access required" });
    }
    const body = UpdateOrgSchema.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ success: false, error: body.error.flatten() });

    const org = await prisma.organisation.update({ where: { id: req.orgId }, data: body.data });
    return reply.send({ success: true, data: org });
  });

  // GET /org/members — list members
  app.get("/members", { preHandler }, async (req, reply) => {
    const members = await prisma.orgMember.findMany({
      where: { orgId: req.orgId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true } } },
      orderBy: { joinedAt: "asc" },
    });
    return reply.send({ success: true, data: members });
  });

  // PATCH /org/members/:userId/role — change member role (OWNER only)
  app.patch("/members/:userId/role", { preHandler }, async (req, reply) => {
    if (req.userRole !== "OWNER") {
      return reply.status(403).send({ success: false, error: "Owner access required" });
    }
    const { userId } = req.params as { userId: string };
    const { role } = req.body as { role: string };

    if (userId === req.userId) return reply.status(400).send({ success: false, error: "Cannot change your own role" });

    const member = await prisma.orgMember.findUnique({ where: { orgId_userId: { orgId: req.orgId, userId } } });
    if (!member) return reply.status(404).send({ success: false, error: "Member not found" });

    const updated = await prisma.orgMember.update({
      where: { orgId_userId: { orgId: req.orgId, userId } },
      data: { role: role as any },
    });
    return reply.send({ success: true, data: updated });
  });

  // DELETE /org/members/:userId — remove member (OWNER only)
  app.delete("/members/:userId", { preHandler }, async (req, reply) => {
    if (req.userRole !== "OWNER") {
      return reply.status(403).send({ success: false, error: "Owner access required" });
    }
    const { userId } = req.params as { userId: string };
    if (userId === req.userId) return reply.status(400).send({ success: false, error: "Cannot remove yourself" });

    await prisma.orgMember.delete({ where: { orgId_userId: { orgId: req.orgId, userId } } });
    return reply.send({ success: true, message: "Member removed" });
  });

  // POST /org/invite — invite new member
  app.post("/invite", { preHandler }, async (req, reply) => {
    if (!["OWNER", "ADMIN"].includes(req.userRole)) {
      return reply.status(403).send({ success: false, error: "Admin access required" });
    }
    const body = InviteUserSchema.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ success: false, error: body.error.flatten() });

    // Check if already a member
    const existingUser = await prisma.user.findUnique({ where: { email: body.data.email } });
    if (existingUser) {
      const isMember = await prisma.orgMember.findUnique({
        where: { orgId_userId: { orgId: req.orgId, userId: existingUser.id } },
      });
      if (isMember) return reply.status(409).send({ success: false, error: "User is already a member" });
    }

    const invite = await prisma.orgInvite.create({
      data: {
        orgId: req.orgId,
        email: body.data.email,
        role: body.data.role,
        expiresAt: addDays(new Date(), 7),
      },
    });

    // In production, send invite email via Resend. Log in dev.
    console.log(`[Invite] Token for ${body.data.email}: ${invite.token}`);

    return reply.status(201).send({
      success: true,
      data: { id: invite.id, email: invite.email, role: invite.role, expiresAt: invite.expiresAt },
      message: "Invitation created (email would be sent in production)",
    });
  });
}
