import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { tenantGuard } from "../middleware/tenant";
import { CreateCustomerSchema, UpdateCustomerSchema, PaginationSchema } from "@antigravity/types";

const preHandler = [authenticate, tenantGuard];

export async function customerRoutes(app: FastifyInstance) {
  app.get("/", { preHandler }, async (req, reply) => {
    const q = PaginationSchema.parse(req.query);
    const where: Record<string, unknown> = { orgId: req.orgId };
    if (q.search) where.OR = [
      { name: { contains: q.search, mode: "insensitive" } },
      { phone: { contains: q.search } },
      { email: { contains: q.search, mode: "insensitive" } },
    ];

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        orderBy: { name: "asc" },
        include: { _count: { select: { bookings: true, earnings: true } } },
      }),
      prisma.customer.count({ where }),
    ]);

    return reply.send({ success: true, data: customers, total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) });
  });

  app.get("/:id", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const customer = await prisma.customer.findFirst({
      where: { id, orgId: req.orgId },
      include: {
        bookings: { orderBy: { startDate: "desc" }, take: 10, include: { car: { select: { registrationNumber: true } } } },
        earnings: { orderBy: { date: "desc" }, take: 10 },
      },
    });
    if (!customer) return reply.status(404).send({ success: false, error: "Customer not found" });
    return reply.send({ success: true, data: customer });
  });

  app.post("/", { preHandler }, async (req, reply) => {
    const body = CreateCustomerSchema.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ success: false, error: body.error.flatten() });
    const customer = await prisma.customer.create({ data: { orgId: req.orgId, ...body.data } });
    return reply.status(201).send({ success: true, data: customer });
  });

  app.patch("/:id", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = UpdateCustomerSchema.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ success: false, error: body.error.flatten() });
    const exists = await prisma.customer.findFirst({ where: { id, orgId: req.orgId } });
    if (!exists) return reply.status(404).send({ success: false, error: "Customer not found" });
    const customer = await prisma.customer.update({ where: { id }, data: body.data });
    return reply.send({ success: true, data: customer });
  });

  app.delete("/:id", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const exists = await prisma.customer.findFirst({ where: { id, orgId: req.orgId } });
    if (!exists) return reply.status(404).send({ success: false, error: "Customer not found" });
    await prisma.customer.delete({ where: { id } });
    return reply.send({ success: true, message: "Customer deleted" });
  });
}
