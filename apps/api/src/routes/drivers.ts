import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { tenantGuard } from "../middleware/tenant";
import { CreateDriverSchema, UpdateDriverSchema, DriverAdvanceSchema, PaginationSchema } from "@antigravity/types";
import { calculateDriverPay } from "@antigravity/utils";
import { format, startOfMonth, endOfMonth } from "date-fns";

const preHandler = [authenticate, tenantGuard];

export async function driverRoutes(app: FastifyInstance) {
  // GET /drivers
  app.get("/", { preHandler }, async (req, reply) => {
    const q = PaginationSchema.parse(req.query);
    const { status } = req.query as { status?: string };

    const where: Record<string, unknown> = { orgId: req.orgId };
    if (status) where.status = status;
    if (q.search) where.OR = [
      { name: { contains: q.search, mode: "insensitive" } },
      { phone: { contains: q.search } },
    ];

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        orderBy: { name: "asc" },
        include: {
          assignedCar: { select: { id: true, registrationNumber: true, make: true, model: true } },
          _count: { select: { advances: true, settlements: true } },
        },
      }),
      prisma.driver.count({ where }),
    ]);

    return reply.send({ success: true, data: drivers, total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) });
  });

  // GET /drivers/:id
  app.get("/:id", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const driver = await prisma.driver.findFirst({
      where: { id, orgId: req.orgId },
      include: {
        assignedCar: true,
        documents: true,
        advances: { orderBy: { date: "desc" }, take: 20 },
        settlements: { orderBy: { month: "desc" }, take: 12 },
      },
    });
    if (!driver) return reply.status(404).send({ success: false, error: "Driver not found" });
    return reply.send({ success: true, data: driver });
  });

  // POST /drivers
  app.post("/", { preHandler }, async (req, reply) => {
    const body = CreateDriverSchema.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ success: false, error: body.error.flatten() });

    const driver = await prisma.driver.create({
      data: {
        orgId: req.orgId,
        ...body.data,
        licenseExpiry: new Date(body.data.licenseExpiry),
        joiningDate: new Date(body.data.joiningDate),
        fixedSalaryPaise: body.data.fixedSalaryPaise ? BigInt(body.data.fixedSalaryPaise) : null,
        thresholdPaise: body.data.thresholdPaise ? BigInt(body.data.thresholdPaise) : null,
      },
    });

    return reply.status(201).send({ success: true, data: driver });
  });

  // PATCH /drivers/:id
  app.patch("/:id", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = UpdateDriverSchema.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ success: false, error: body.error.flatten() });

    const exists = await prisma.driver.findFirst({ where: { id, orgId: req.orgId } });
    if (!exists) return reply.status(404).send({ success: false, error: "Driver not found" });

    const { fixedSalaryPaise, thresholdPaise, licenseExpiry, joiningDate, ...rest } = body.data;
    const driver = await prisma.driver.update({
      where: { id },
      data: {
        ...rest,
        ...(fixedSalaryPaise !== undefined ? { fixedSalaryPaise: BigInt(fixedSalaryPaise) } : {}),
        ...(thresholdPaise !== undefined ? { thresholdPaise: BigInt(thresholdPaise) } : {}),
        ...(licenseExpiry ? { licenseExpiry: new Date(licenseExpiry) } : {}),
        ...(joiningDate ? { joiningDate: new Date(joiningDate) } : {}),
      },
    });

    return reply.send({ success: true, data: driver });
  });

  // DELETE /drivers/:id
  app.delete("/:id", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const exists = await prisma.driver.findFirst({ where: { id, orgId: req.orgId } });
    if (!exists) return reply.status(404).send({ success: false, error: "Driver not found" });
    await prisma.driver.delete({ where: { id } });
    return reply.send({ success: true, message: "Driver deleted" });
  });

  // POST /drivers/:id/assign
  app.post("/:id/assign", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const { carId } = req.body as { carId: string | null };

    const driver = await prisma.driver.findFirst({ where: { id, orgId: req.orgId } });
    if (!driver) return reply.status(404).send({ success: false, error: "Driver not found" });

    if (carId) {
      const car = await prisma.car.findFirst({ where: { id: carId, orgId: req.orgId } });
      if (!car) return reply.status(404).send({ success: false, error: "Car not found" });
    }

    const updated = await prisma.driver.update({ where: { id }, data: { assignedCarId: carId } });
    return reply.send({ success: true, data: updated });
  });

  // POST /drivers/:id/advances
  app.post("/:id/advances", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = DriverAdvanceSchema.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ success: false, error: body.error.flatten() });

    const driver = await prisma.driver.findFirst({ where: { id, orgId: req.orgId } });
    if (!driver) return reply.status(404).send({ success: false, error: "Driver not found" });

    const advance = await prisma.driverAdvance.create({
      data: {
        driverId: id,
        amountPaise: BigInt(body.data.amountPaise),
        date: new Date(body.data.date),
        reason: body.data.reason,
      },
    });

    return reply.status(201).send({ success: true, data: advance });
  });

  // POST /drivers/:id/settlement — generate monthly settlement
  app.post("/:id/settlement", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const { month } = req.body as { month: string }; // "2024-01"

    const driver = await prisma.driver.findFirst({ where: { id, orgId: req.orgId } });
    if (!driver) return reply.status(404).send({ success: false, error: "Driver not found" });

    const existing = await prisma.driverSettlement.findUnique({ where: { driverId_month: { driverId: id, month } } });
    if (existing) return reply.status(409).send({ success: false, error: "Settlement already exists for this month" });

    const [year, mon] = month.split("-").map(Number);
    const start = startOfMonth(new Date(year, mon - 1));
    const end = endOfMonth(start);

    // Total earnings for the car this driver was on
    const earnings = await prisma.earning.aggregate({
      where: { carId: driver.assignedCarId ?? undefined, date: { gte: start, lte: end } },
      _sum: { amountPaise: true },
    });

    const grossEarningsPaise = Number(earnings._sum.amountPaise ?? 0);

    // Unsettled advances
    const advances = await prisma.driverAdvance.findMany({
      where: { driverId: id, settledIn: null },
    });
    const advancesDeductedPaise = advances.reduce((sum: number, a: any) => sum + Number(a.amountPaise), 0);

    // Calculate salary due
    const salaryDuePaise = calculateDriverPay({
      compensationType: driver.compensationType as "FIXED" | "PERCENTAGE" | "HYBRID",
      netEarningPaise: grossEarningsPaise,
      fixedSalaryPaise: Number(driver.fixedSalaryPaise ?? 0),
      percentageRate: Number(driver.percentageRate ?? 0),
      thresholdPaise: Number(driver.thresholdPaise ?? 0),
    });

    const netPayablePaise = Math.max(0, salaryDuePaise - advancesDeductedPaise);

    const settlement = await prisma.$transaction(async (tx: any) => {
      const s = await tx.driverSettlement.create({
        data: {
          driverId: id,
          month,
          grossEarningsPaise: BigInt(grossEarningsPaise),
          advancesDeductedPaise: BigInt(advancesDeductedPaise),
          salaryDuePaise: BigInt(salaryDuePaise),
          netPayablePaise: BigInt(netPayablePaise),
        },
      });

      // Mark advances as settled
      if (advances.length > 0) {
        await tx.driverAdvance.updateMany({
          where: { id: { in: advances.map((a: any) => a.id) } },
          data: { settledIn: s.id },
        });
      }

      return s;
    });

    return reply.status(201).send({ success: true, data: settlement });
  });
}
