import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { tenantGuard } from "../middleware/tenant";
import { CreateBookingSchema, UpdateBookingSchema, CompleteBookingSchema, PaginationSchema } from "@antigravity/types";

const preHandler = [authenticate, tenantGuard];

export async function bookingRoutes(app: FastifyInstance) {
  // GET /bookings
  app.get("/", { preHandler }, async (req, reply) => {
    const q = PaginationSchema.parse(req.query);
    const { status, carId, startDate, endDate } = req.query as Record<string, string>;

    const where: Record<string, unknown> = { orgId: req.orgId };
    if (status) where.status = status;
    if (carId) where.carId = carId;
    if (startDate && endDate) where.startDate = { gte: new Date(startDate), lte: new Date(endDate) };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        orderBy: { startDate: q.sortOrder },
        include: {
          car: { select: { registrationNumber: true, make: true, model: true } },
          driver: { select: { id: true, name: true, phone: true } },
          customer: { select: { id: true, name: true, phone: true } },
          invoice: { select: { id: true, invoiceNo: true, status: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return reply.send({ success: true, data: bookings, total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) });
  });

  // GET /bookings/calendar — returns thin list for calendar view (no pagination)
  app.get("/calendar", { preHandler }, async (req, reply) => {
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };
    if (!startDate || !endDate) {
      return reply.status(400).send({ success: false, error: "startDate and endDate required" });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        orgId: req.orgId,
        startDate: { gte: new Date(startDate), lte: new Date(endDate) },
      },
      select: {
        id: true, status: true, startDate: true, endDate: true,
        pickupLocation: true, dropLocation: true,
        quotedAmountPaise: true,
        car: { select: { registrationNumber: true } },
        driver: { select: { name: true } },
        customerName: true,
      },
    });

    return reply.send({ success: true, data: bookings });
  });

  // GET /bookings/:id
  app.get("/:id", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const booking = await prisma.booking.findFirst({
      where: { id, orgId: req.orgId },
      include: {
        car: true,
        driver: true,
        customer: true,
        invoice: true,
        earnings: true,
      },
    });
    if (!booking) return reply.status(404).send({ success: false, error: "Booking not found" });
    return reply.send({ success: true, data: booking });
  });

  // POST /bookings
  app.post("/", { preHandler }, async (req, reply) => {
    const body = CreateBookingSchema.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ success: false, error: body.error.flatten() });

    const car = await prisma.car.findFirst({ where: { id: body.data.carId, orgId: req.orgId } });
    if (!car) return reply.status(404).send({ success: false, error: "Car not found" });

    const booking = await prisma.booking.create({
      data: {
        orgId: req.orgId,
        carId: body.data.carId,
        driverId: body.data.driverId,
        customerId: body.data.customerId,
        customerName: body.data.customerName,
        customerPhone: body.data.customerPhone,
        source: body.data.source,
        status: body.data.status,
        pickupLocation: body.data.pickupLocation,
        dropLocation: body.data.dropLocation,
        startDate: new Date(body.data.startDate),
        endDate: body.data.endDate ? new Date(body.data.endDate) : null,
        estimatedKm: body.data.estimatedKm,
        quotedAmountPaise: BigInt(body.data.quotedAmountPaise),
        advancePaidPaise: BigInt(body.data.advancePaidPaise ?? 0),
        notes: body.data.notes,
      },
    });

    return reply.status(201).send({ success: true, data: booking });
  });

  // PATCH /bookings/:id
  app.patch("/:id", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = UpdateBookingSchema.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ success: false, error: body.error.flatten() });

    const exists = await prisma.booking.findFirst({ where: { id, orgId: req.orgId } });
    if (!exists) return reply.status(404).send({ success: false, error: "Booking not found" });

    const { quotedAmountPaise, advancePaidPaise, startDate, endDate, ...rest } = body.data;
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        ...rest,
        ...(quotedAmountPaise ? { quotedAmountPaise: BigInt(quotedAmountPaise) } : {}),
        ...(advancePaidPaise !== undefined ? { advancePaidPaise: BigInt(advancePaidPaise) } : {}),
        ...(startDate ? { startDate: new Date(startDate) } : {}),
        ...(endDate ? { endDate: new Date(endDate) } : {}),
      },
    });

    return reply.send({ success: true, data: booking });
  });

  // POST /bookings/:id/complete
  app.post("/:id/complete", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = CompleteBookingSchema.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ success: false, error: body.error.flatten() });

    const booking = await prisma.booking.findFirst({ where: { id, orgId: req.orgId } });
    if (!booking) return reply.status(404).send({ success: false, error: "Booking not found" });
    if (booking.status === "COMPLETED") return reply.status(400).send({ success: false, error: "Already completed" });

    const [updated] = await prisma.$transaction([
      prisma.booking.update({
        where: { id },
        data: {
          status: "COMPLETED",
          actualKm: body.data.actualKm,
          finalAmountPaise: BigInt(body.data.finalAmountPaise),
          endOdometer: body.data.endOdometer,
          notes: body.data.notes,
          completedAt: new Date(),
        },
      }),
      // Auto-create earning for the booking
      prisma.earning.create({
        data: {
          orgId: req.orgId,
          carId: booking.carId,
          source: booking.source,
          amountPaise: BigInt(body.data.finalAmountPaise),
          date: new Date(),
          bookingId: id,
          customerId: booking.customerId,
          description: `Booking: ${booking.pickupLocation} → ${booking.dropLocation ?? ""}`,
          tripKm: body.data.actualKm,
        },
      }),
    ]);

    return reply.send({ success: true, data: updated });
  });

  // POST /bookings/:id/cancel
  app.post("/:id/cancel", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const { reason } = req.body as { reason?: string };

    const booking = await prisma.booking.findFirst({ where: { id, orgId: req.orgId } });
    if (!booking) return reply.status(404).send({ success: false, error: "Booking not found" });
    if (["COMPLETED", "CANCELLED"].includes(booking.status)) {
      return reply.status(400).send({ success: false, error: `Cannot cancel a ${booking.status.toLowerCase()} booking` });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED", cancelledAt: new Date(), notes: reason },
    });

    return reply.send({ success: true, data: updated });
  });

  // DELETE /bookings/:id
  app.delete("/:id", { preHandler }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const exists = await prisma.booking.findFirst({ where: { id, orgId: req.orgId } });
    if (!exists) return reply.status(404).send({ success: false, error: "Booking not found" });
    await prisma.booking.delete({ where: { id } });
    return reply.send({ success: true, message: "Booking deleted" });
  });
}
