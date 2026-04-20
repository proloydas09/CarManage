import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyAccessToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";

declare module "fastify" {
  interface FastifyRequest {
    userId: string;
    orgId: string;
    userRole: string;
  }
}

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return reply.status(401).send({ success: false, error: "Missing or invalid Authorization header" });
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    req.orgId = payload.orgId;
    req.userRole = payload.role;
  } catch {
    return reply.status(401).send({ success: false, error: "Invalid or expired token" });
  }
}

export async function requireRole(roles: string[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    if (!roles.includes(req.userRole)) {
      return reply.status(403).send({ success: false, error: "Insufficient permissions" });
    }
  };
}

export const requireOwner = requireRole(["OWNER"]);
export const requireAdmin = requireRole(["OWNER", "ADMIN"]);
export const requireManager = requireRole(["OWNER", "ADMIN", "MANAGER"]);
