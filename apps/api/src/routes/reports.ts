import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { tenantGuard } from "../middleware/tenant";
import { subMonths, startOfMonth, endOfMonth, format, eachMonthOfInterval } from "date-fns";

const preHandler = [authenticate, tenantGuard];

export async function reportRoutes(app: FastifyInstance) {
  // GET /reports/fleet-pnl — fleet-wide P&L for a date range
  app.get("/fleet-pnl", { preHandler }, async (req, reply) => {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const start = startDate ? new Date(startDate) : startOfMonth(subMonths(new Date(), 5));
    const end = endDate ? new Date(endDate) : endOfMonth(new Date());

    const cars = await prisma.car.findMany({
      where: { orgId: req.orgId },
      select: { id: true, registrationNumber: true, make: true, model: true },
    });

    const carPnl = await Promise.all(
      cars.map(async (car: any) => {
        const [earningsAgg, costsAgg] = await Promise.all([
          prisma.earning.aggregate({ where: { carId: car.id, date: { gte: start, lte: end } }, _sum: { amountPaise: true } }),
          prisma.cost.aggregate({ where: { carId: car.id, date: { gte: start, lte: end } }, _sum: { amountPaise: true } }),
        ]);

        const revenuePaise = Number(earningsAgg._sum.amountPaise ?? 0);
        const costPaise = Number(costsAgg._sum.amountPaise ?? 0);
        const netProfitPaise = revenuePaise - costPaise;

        return {
          carId: car.id,
          registrationNumber: car.registrationNumber,
          make: car.make,
          model: car.model,
          revenuePaise,
          costPaise,
          netProfitPaise,
          profitMarginPct: revenuePaise > 0 ? +((netProfitPaise / revenuePaise) * 100).toFixed(2) : 0,
        };
      })
    );

    const totalRevenuePaise = carPnl.reduce((s: number, c: any) => s + c.revenuePaise, 0);
    const totalCostPaise = carPnl.reduce((s: number, c: any) => s + c.costPaise, 0);

    return reply.send({
      success: true,
      data: {
        period: { startDate: start.toISOString(), endDate: end.toISOString() },
        totalRevenuePaise,
        totalCostPaise,
        netProfitPaise: totalRevenuePaise - totalCostPaise,
        cars: carPnl.sort((a, b) => b.netProfitPaise - a.netProfitPaise),
      },
    });
  });

  // GET /reports/monthly-trend — month-by-month revenue vs cost
  app.get("/monthly-trend", { preHandler }, async (req, reply) => {
    const { months = "6" } = req.query as { months?: string };
    const n = Math.min(parseInt(months, 10) || 6, 24);
    const monthRange = eachMonthOfInterval({ start: subMonths(new Date(), n - 1), end: new Date() });

    const trend = await Promise.all(
      monthRange.map(async (month) => {
        const start = startOfMonth(month);
        const end = endOfMonth(month);
        const [earningsAgg, costsAgg] = await Promise.all([
          prisma.earning.aggregate({ where: { orgId: req.orgId, date: { gte: start, lte: end } }, _sum: { amountPaise: true } }),
          prisma.cost.aggregate({ where: { orgId: req.orgId, date: { gte: start, lte: end } }, _sum: { amountPaise: true } }),
        ]);

        const revenuePaise = Number(earningsAgg._sum.amountPaise ?? 0);
        const costPaise = Number(costsAgg._sum.amountPaise ?? 0);
        return {
          month: format(month, "yyyy-MM"),
          label: format(month, "MMM yy"),
          revenuePaise,
          costPaise,
          netProfitPaise: revenuePaise - costPaise,
        };
      })
    );

    return reply.send({ success: true, data: trend });
  });

  // GET /reports/cost-breakdown — costs grouped by category for period
  app.get("/cost-breakdown", { preHandler }, async (req, reply) => {
    const { startDate, endDate, carId } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId: req.orgId };
    if (carId) where.carId = carId;
    if (startDate && endDate) where.date = { gte: new Date(startDate), lte: new Date(endDate) };

    const breakdown = await prisma.cost.groupBy({
      by: ["category"],
      where,
      _sum: { amountPaise: true },
      _count: true,
      orderBy: { _sum: { amountPaise: "desc" } },
    });

    const total = breakdown.reduce((s: number, b: any) => s + Number(b._sum.amountPaise ?? 0), 0);

    return reply.send({
      success: true,
      data: breakdown.map((b: any) => ({
        category: b.category,
        amountPaise: Number(b._sum.amountPaise ?? 0),
        count: b._count,
        pct: total > 0 ? +((Number(b._sum.amountPaise ?? 0) / total) * 100).toFixed(2) : 0,
      })),
    });
  });

  // GET /reports/dashboard — overview stats
  app.get("/dashboard", { preHandler }, async (req, reply) => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const [
      totalCars, activeCars,
      thisMonthRevenue, thisMonthCost,
      lastMonthRevenue, lastMonthCost,
      pendingSettlements,
      expiringDocuments,
      recentBookings,
    ] = await Promise.all([
      prisma.car.count({ where: { orgId: req.orgId } }),
      prisma.car.count({ where: { orgId: req.orgId, status: "ACTIVE" } }),
      prisma.earning.aggregate({ where: { orgId: req.orgId, date: { gte: monthStart, lte: monthEnd } }, _sum: { amountPaise: true } }),
      prisma.cost.aggregate({ where: { orgId: req.orgId, date: { gte: monthStart, lte: monthEnd } }, _sum: { amountPaise: true } }),
      prisma.earning.aggregate({ where: { orgId: req.orgId, date: { gte: lastMonthStart, lte: lastMonthEnd } }, _sum: { amountPaise: true } }),
      prisma.cost.aggregate({ where: { orgId: req.orgId, date: { gte: lastMonthStart, lte: lastMonthEnd } }, _sum: { amountPaise: true } }),
      prisma.driverSettlement.count({ where: { driver: { orgId: req.orgId }, status: "PENDING" } }),
      prisma.document.count({ where: { OR: [{ car: { orgId: req.orgId } }, { driver: { orgId: req.orgId } }], expiryDate: { gte: now, lte: new Date(now.getTime() + 30 * 86400000) } } }),
      prisma.booking.findMany({ where: { orgId: req.orgId, status: { in: ["CONFIRMED", "IN_PROGRESS"] } }, orderBy: { startDate: "asc" }, take: 5, include: { car: { select: { registrationNumber: true } } } }),
    ]);

    const thisMonthRevPaise = Number(thisMonthRevenue._sum.amountPaise ?? 0);
    const thisMonthCostPaise = Number(thisMonthCost._sum.amountPaise ?? 0);
    const lastMonthRevPaise = Number(lastMonthRevenue._sum.amountPaise ?? 0);
    const lastMonthCostPaise = Number(lastMonthCost._sum.amountPaise ?? 0);

    return reply.send({
      success: true,
      data: {
        totalCars, activeCars,
        thisMonth: {
          revenuePaise: thisMonthRevPaise,
          costPaise: thisMonthCostPaise,
          netProfitPaise: thisMonthRevPaise - thisMonthCostPaise,
        },
        lastMonth: {
          revenuePaise: lastMonthRevPaise,
          costPaise: lastMonthCostPaise,
          netProfitPaise: lastMonthRevPaise - lastMonthCostPaise,
        },
        revenueMom: lastMonthRevPaise > 0 ? +(((thisMonthRevPaise - lastMonthRevPaise) / lastMonthRevPaise) * 100).toFixed(1) : 0,
        pendingSettlements,
        expiringDocuments,
        upcomingBookings: recentBookings,
      },
    });
  });
}
