import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { tenantGuard } from "../middleware/tenant";
import {
  CreateCarSchema, UpdateCarSchema, OdometerEntrySchema, PaginationSchema,
} from "@antigravity/types";
import { PLAN_CAR_LIMITS, PlanTier } from "@antigravity/types";

const preHandler = [authenticate, tenantGuard];

export async function carRoutes(app: FastifyInstance) {
  // GET /cars
  app.get("/", { preHandler }, async (req, reply) => {
    const q = PaginationSchema.parse(req.query);
    const where = {
      orgId: req.orgId,
      ...(q.search
        ? {
            OR: [
              { registrationNumber: { contains: q.search, mode: "insensitive" as const } },
              { make: { contains: q.search, mode: "insensitive" as const } },
              { model: { contains: q.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        orderBy: { [q.sortBy ?? "createdAt"]: q.sortOrder },
        include: {
          drivers: { where: { status: "ACTIVE" }, select: { id: true, name: true } },
          _count: { select: { costs: true, earnings: true, bookings: true } },
        },
      }),
      prisma.car.count({ where }),
    ]);

    return reply.send({
      success: true,
      data: cars,
      total,
      page: q.page,
      limit: q.limit,
      totalPages: Math.ceil(total / q.limit),
    });
  });

  // GET /cars/:id
  app.get("/:id", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const car = await prisma.car.findFirst({
      where: { id, orgId: req.orgId },
      include: {
        drivers: { select: { id: true, name: true, phone: true, status: true } },
        documents: { orderBy: { expiryDate: "asc" } },
        odometerLogs: { orderBy: { readingDate: "desc" }, take: 10 },
      },
    });

    if (!car) return reply.status(404).send({ success: false, error: "Car not found" });
    return reply.send({ success: true, data: car });
  });

  // POST /cars
  app.post("/", { preHandler }, async (req, reply) => {
    const body = CreateCarSchema.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ success: false, error: body.error.flatten() });

    // Plan limit check
    const org = await prisma.organisation.findUnique({ where: { id: req.orgId }, select: { plan: true } });
    const limit = PLAN_CAR_LIMITS[org!.plan as PlanTier];
    const count = await prisma.car.count({ where: { orgId: req.orgId } });
    if (count >= limit) {
      return reply.status(403).send({
        success: false,
        error: `Plan limit reached. Your ${org!.plan} plan allows ${limit} cars. Upgrade to add more.`,
      });
    }

    const car = await prisma.car.create({
      data: {
        orgId: req.orgId,
        ...body.data,
        purchasePricePaise: BigInt(body.data.purchasePrice),
        purchaseDate: new Date(body.data.purchaseDate),
      },
    });

    return reply.status(201).send({ success: true, data: car });
  });

  // PATCH /cars/:id
  app.patch("/:id", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = UpdateCarSchema.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ success: false, error: body.error.flatten() });

    const exists = await prisma.car.findFirst({ where: { id, orgId: req.orgId } });
    if (!exists) return reply.status(404).send({ success: false, error: "Car not found" });

    const { purchasePrice, purchaseDate, ...rest } = body.data;
    const car = await prisma.car.update({
      where: { id },
      data: {
        ...rest,
        ...(purchasePrice ? { purchasePricePaise: BigInt(purchasePrice) } : {}),
        ...(purchaseDate ? { purchaseDate: new Date(purchaseDate) } : {}),
      },
    });

    return reply.send({ success: true, data: car });
  });

  // DELETE /cars/:id
  app.delete("/:id", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const exists = await prisma.car.findFirst({ where: { id, orgId: req.orgId } });
    if (!exists) return reply.status(404).send({ success: false, error: "Car not found" });

    await prisma.car.delete({ where: { id } });
    return reply.send({ success: true, message: "Car deleted" });
  });

  // POST /cars/:id/odometer
  app.post("/:id/odometer", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = OdometerEntrySchema.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ success: false, error: body.error.flatten() });

    const car = await prisma.car.findFirst({ where: { id, orgId: req.orgId } });
    if (!car) return reply.status(404).send({ success: false, error: "Car not found" });

    if (body.data.reading <= car.currentOdometer) {
      return reply.status(400).send({ success: false, error: "New reading must be greater than current odometer" });
    }

    const [log] = await prisma.$transaction([
      prisma.odometerLog.create({
        data: { carId: id, reading: body.data.reading, readingDate: new Date(body.data.readingDate), notes: body.data.notes },
      }),
      prisma.car.update({ where: { id }, data: { currentOdometer: body.data.reading } }),
    ]);

    return reply.status(201).send({ success: true, data: log });
  });

  // GET /cars/:id/pnl  — summary P&L for a car
  app.get("/:id/pnl", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

    const car = await prisma.car.findFirst({ where: { id, orgId: req.orgId } });
    if (!car) return reply.status(404).send({ success: false, error: "Car not found" });

    const dateFilter = startDate && endDate
      ? { gte: new Date(startDate), lte: new Date(endDate) }
      : undefined;

    const [earnings, costs] = await Promise.all([
      prisma.earning.aggregate({ where: { carId: id, ...(dateFilter ? { date: dateFilter } : {}) }, _sum: { amountPaise: true } }),
      prisma.cost.aggregate({ where: { carId: id, ...(dateFilter ? { date: dateFilter } : {}) }, _sum: { amountPaise: true } }),
    ]);

    const revenuePaise = Number(earnings._sum.amountPaise ?? 0);
    const costPaise = Number(costs._sum.amountPaise ?? 0);
    const netProfitPaise = revenuePaise - costPaise;

    return reply.send({
      success: true,
      data: {
        carId: id,
        registrationNumber: car.registrationNumber,
        revenuePaise,
        costPaise,
        netProfitPaise,
        profitMarginPct: revenuePaise > 0 ? ((netProfitPaise / revenuePaise) * 100).toFixed(2) : "0.00",
      },
    });
  });
}
