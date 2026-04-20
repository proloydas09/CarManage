import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { tenantGuard } from "../middleware/tenant";
import { CreateCostSchema, UpdateCostSchema, BulkCreateCostSchema, PaginationSchema } from "@antigravity/types";

const preHandler = [authenticate, tenantGuard];

export async function costRoutes(app: FastifyInstance) {
  // GET /costs
  app.get("/", { preHandler }, async (req, reply) => {
    const q = PaginationSchema.parse(req.query);
    const { carId, category, startDate, endDate } = req.query as Record<string, string>;

    const where: Record<string, unknown> = { orgId: req.orgId };
    if (carId) where.carId = carId;
    if (category) where.category = category;
    if (startDate && endDate) where.date = { gte: new Date(startDate), lte: new Date(endDate) };

    const [costs, total] = await Promise.all([
      prisma.cost.findMany({
        where,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        orderBy: { date: q.sortOrder },
        include: { car: { select: { registrationNumber: true, make: true, model: true } } },
      }),
      prisma.cost.count({ where }),
    ]);

    return reply.send({ success: true, data: costs, total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) });
  });

  // GET /costs/summary — cost breakdown by category
  app.get("/summary", { preHandler }, async (req, reply) => {
    const { carId, startDate, endDate } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId: req.orgId };
    if (carId) where.carId = carId;
    if (startDate && endDate) where.date = { gte: new Date(startDate), lte: new Date(endDate) };

    const summary = await prisma.cost.groupBy({
      by: ["category"],
      where,
      _sum: { amountPaise: true },
      _count: true,
    });

    return reply.send({ success: true, data: summary });
  });

  // GET /costs/:id
  app.get("/:id", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const cost = await prisma.cost.findFirst({ where: { id, orgId: req.orgId }, include: { car: true } });
    if (!cost) return reply.status(404).send({ success: false, error: "Cost not found" });
    return reply.send({ success: true, data: cost });
  });

  // POST /costs
  app.post("/", { preHandler }, async (req, reply) => {
    const body = CreateCostSchema.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ success: false, error: body.error.flatten() });

    const car = await prisma.car.findFirst({ where: { id: body.data.carId, orgId: req.orgId } });
    if (!car) return reply.status(404).send({ success: false, error: "Car not found or not in your org" });

    const cost = await prisma.cost.create({
      data: {
        orgId: req.orgId,
        carId: body.data.carId,
        category: body.data.category,
        amountPaise: BigInt(body.data.amountPaise),
        date: new Date(body.data.date),
        description: body.data.description,
        vendorName: body.data.vendorName,
        receiptUrl: body.data.receiptUrl,
        isRecurring: body.data.isRecurring,
        recurringDay: body.data.recurringDay,
      },
    });

    return reply.status(201).send({ success: true, data: cost });
  });

  // POST /costs/bulk
  app.post("/bulk", { preHandler }, async (req, reply) => {
    const body = BulkCreateCostSchema.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ success: false, error: body.error.flatten() });

    // Verify all carIds belong to org
    const carIds = [...new Set(body.data.costs.map((c) => c.carId))];
    const carCount = await prisma.car.count({ where: { id: { in: carIds }, orgId: req.orgId } });
    if (carCount !== carIds.length) {
      return reply.status(400).send({ success: false, error: "One or more cars not found in your organisation" });
    }

    const costs = await prisma.cost.createMany({
      data: body.data.costs.map((c) => ({
        orgId: req.orgId,
        carId: c.carId,
        category: c.category,
        amountPaise: BigInt(c.amountPaise),
        date: new Date(c.date),
        description: c.description,
        vendorName: c.vendorName,
        isRecurring: c.isRecurring,
        recurringDay: c.recurringDay,
      })),
    });

    return reply.status(201).send({ success: true, data: { count: costs.count } });
  });

  // PATCH /costs/:id
  app.patch("/:id", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = UpdateCostSchema.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ success: false, error: body.error.flatten() });

    const exists = await prisma.cost.findFirst({ where: { id, orgId: req.orgId } });
    if (!exists) return reply.status(404).send({ success: false, error: "Cost not found" });

    const { amountPaise, date, ...rest } = body.data;
    const cost = await prisma.cost.update({
      where: { id },
      data: {
        ...rest,
        ...(amountPaise ? { amountPaise: BigInt(amountPaise) } : {}),
        ...(date ? { date: new Date(date) } : {}),
      },
    });

    return reply.send({ success: true, data: cost });
  });

  // DELETE /costs/:id
  app.delete("/:id", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const exists = await prisma.cost.findFirst({ where: { id, orgId: req.orgId } });
    if (!exists) return reply.status(404).send({ success: false, error: "Cost not found" });

    await prisma.cost.delete({ where: { id } });
    return reply.send({ success: true, message: "Cost deleted" });
  });
}
