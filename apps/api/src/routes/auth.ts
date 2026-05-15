import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { addDays } from "date-fns";
import { prisma } from "../lib/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { authenticate } from "../middleware/auth";
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from "@antigravity/types";

/** Generate a default avatar URL from user initials when no custom avatar is set */
function resolveAvatarUrl(avatarUrl: string | null | undefined, name: string): string {
  if (avatarUrl) return avatarUrl;
  const encoded = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encoded}&background=6366f1&color=fff&size=128&bold=true`;
}

export async function authRoutes(app: FastifyInstance) {
  // POST /auth/register
  app.post("/register", async (req, reply) => {
    const body = RegisterSchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({ success: false, error: body.error.flatten() });
    }

    const { name, email, password, orgName, phone } = body.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.status(409).send({ success: false, error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [user, org] = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({ data: { name, email, passwordHash, phone, isVerified: true } });
      const org = await tx.organisation.create({ data: { name: orgName } });
      await tx.orgMember.create({ data: { orgId: org.id, userId: user.id, role: "OWNER" } });
      return [user, org];
    });

    const accessToken = signAccessToken({ sub: user.id, orgId: org.id, role: "OWNER" });
    const refreshToken = signRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt: addDays(new Date(), 30) },
    });

    return reply.status(201).send({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email },
        org: { id: org.id, name: org.name },
        tokens: { accessToken, refreshToken },
      },
    });
  });

  // POST /auth/login
  app.post("/login", async (req, reply) => {
    const body = LoginSchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({ success: false, error: body.error.flatten() });
    }

    const { email, password } = body.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { memberships: { include: { org: true } } },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return reply.status(401).send({ success: false, error: "Invalid email or password" });
    }

    const membership = user.memberships[0];
    if (!membership) {
      return reply.status(403).send({ success: false, error: "No organisation associated" });
    }

    const accessToken = signAccessToken({ sub: user.id, orgId: membership.orgId, role: membership.role });
    const refreshToken = signRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt: addDays(new Date(), 30) },
    });

    return reply.send({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, avatarUrl: resolveAvatarUrl(user.avatarUrl, user.name) },
        org: { id: membership.org.id, name: membership.org.name, plan: membership.org.plan },
        role: membership.role,
        tokens: { accessToken, refreshToken },
      },
    });
  });

  // POST /auth/refresh
  app.post("/refresh", async (req, reply) => {
    const body = RefreshTokenSchema.safeParse(req.body);
    if (!body.success) {
      return reply.status(400).send({ success: false, error: "refreshToken required" });
    }

    let payload: { sub: string };
    try {
      payload = verifyRefreshToken(body.data.refreshToken);
    } catch {
      return reply.status(401).send({ success: false, error: "Invalid refresh token" });
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { token: body.data.refreshToken },
      include: { user: { include: { memberships: true } } },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      return reply.status(401).send({ success: false, error: "Token revoked or expired" });
    }

    // Revoke old, issue new (rotation)
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

    const membership = stored.user.memberships[0];
    const newAccess = signAccessToken({ sub: stored.userId, orgId: membership.orgId, role: membership.role });
    const newRefresh = signRefreshToken(stored.userId);

    await prisma.refreshToken.create({
      data: { userId: stored.userId, token: newRefresh, expiresAt: addDays(new Date(), 30) },
    });

    return reply.send({ success: true, data: { accessToken: newAccess, refreshToken: newRefresh } });
  });

  // POST /auth/logout
  app.post("/logout", { preHandler: [authenticate] }, async (req, reply) => {
    const body = req.body as { refreshToken?: string };
    if (body?.refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: body.refreshToken },
        data: { revokedAt: new Date() },
      });
    }
    return reply.send({ success: true, message: "Logged out" });
  });

  // GET /auth/me
  app.get("/me", { preHandler: [authenticate] }, async (req, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, phone: true, avatarUrl: true, createdAt: true },
    });

    const membership = await prisma.orgMember.findFirst({
      where: { userId: req.userId, orgId: req.orgId },
      include: { org: { select: { id: true, name: true, plan: true, planExpiry: true, logoUrl: true, gstin: true } } },
    });

    // Resolve avatar URL so clients always get a usable URL
    const resolvedUser = user ? { ...user, avatarUrl: resolveAvatarUrl(user.avatarUrl, user.name) } : user;

    return reply.send({
      success: true,
      data: { user: resolvedUser, org: membership?.org, role: membership?.role },
    });
  });
}
