import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { tenantGuard } from "../middleware/tenant";
import { CreateEarningSchema, UpdateEarningSchema, PaginationSchema } from "@antigravity/types";

const preHandler = [authenticate, tenantGuard];

export async function earningRoutes(app: FastifyInstance) {
  // GET /earnings
  app.get("/", { preHandler }, async (req, reply) => {
    const q = PaginationSchema.parse(req.query);
    const { carId, source, startDate, endDate } = req.query as Record<string, string>;

    const where: Record<string, unknown> = { orgId: req.orgId };
    if (carId) where.carId = carId;
    if (source) where.source = source;
    if (startDate && endDate) where.date = { gte: new Date(startDate), lte: new Date(endDate) };

    const [earnings, total] = await Promise.all([
      prisma.earning.findMany({
        where,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        orderBy: { date: q.sortOrder },
        include: {
          car: { select: { registrationNumber: true, make: true, model: true } },
          customer: { select: { id: true, name: true } },
        },
      }),
      prisma.earning.count({ where }),
    ]);

    return reply.send({ success: true, data: earnings, total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) });
  });

  // GET /earnings/summary
  app.get("/summary", { preHandler }, async (req, reply) => {
    const { carId, startDate, endDate } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId: req.orgId };
    if (carId) where.carId = carId;
    if (startDate && endDate) where.date = { gte: new Date(startDate), lte: new Date(endDate) };

    const [bySource, total] = await Promise.all([
      prisma.earning.groupBy({ by: ["source"], where, _sum: { amountPaise: true }, _count: true }),
      prisma.earning.aggregate({ where, _sum: { amountPaise: true } }),
    ]);

    return reply.send({ success: true, data: { bySource, totalPaise: Number(total._sum.amountPaise ?? 0) } });
  });

  // GET /earnings/:id
  app.get("/:id", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const earning = await prisma.earning.findFirst({ where: { id, orgId: req.orgId }, include: { car: true, customer: true } });
    if (!earning) return reply.status(404).send({ success: false, error: "Earning not found" });
    return reply.send({ success: true, data: earning });
  });

  // POST /earnings
  app.post("/", { preHandler }, async (req, reply) => {
    const body = CreateEarningSchema.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ success: false, error: body.error.flatten() });

    const car = await prisma.car.findFirst({ where: { id: body.data.carId, orgId: req.orgId } });
    if (!car) return reply.status(404).send({ success: false, error: "Car not found" });

    const earning = await prisma.earning.create({
      data: {
        orgId: req.orgId,
        carId: body.data.carId,
        source: body.data.source,
        amountPaise: BigInt(body.data.amountPaise),
        date: new Date(body.data.date),
        customerId: body.data.customerId,
        bookingId: body.data.bookingId,
        description: body.data.description,
        tripKm: body.data.tripKm,
      },
    });

    return reply.status(201).send({ success: true, data: earning });
  });

  // PATCH /earnings/:id
  app.patch("/:id", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = UpdateEarningSchema.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ success: false, error: body.error.flatten() });

    const exists = await prisma.earning.findFirst({ where: { id, orgId: req.orgId } });
    if (!exists) return reply.status(404).send({ success: false, error: "Earning not found" });

    const { amountPaise, date, ...rest } = body.data;
    const earning = await prisma.earning.update({
      where: { id },
      data: {
        ...rest,
        ...(amountPaise ? { amountPaise: BigInt(amountPaise) } : {}),
        ...(date ? { date: new Date(date) } : {}),
      },
    });

    return reply.send({ success: true, data: earning });
  });

  // DELETE /earnings/:id
  app.delete("/:id", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const exists = await prisma.earning.findFirst({ where: { id, orgId: req.orgId } });
    if (!exists) return reply.status(404).send({ success: false, error: "Earning not found" });

    await prisma.earning.delete({ where: { id } });
    return reply.send({ success: true, message: "Earning deleted" });
  });
}
