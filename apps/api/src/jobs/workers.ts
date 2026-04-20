import { Worker } from "bullmq";
import { redis } from "../lib/redis";
import { prisma } from "../lib/prisma";
import { endOfMonth, startOfMonth, addDays } from "date-fns";

const CONNECTION = { connection: redis };

// ── Recurring Cost Job ────────────────────────────────────────────────────────
// Runs daily: clones any isRecurring costs for the current day-of-month

export function startRecurringCostWorker() {
  return new Worker(
    "recurring-cost",
    async (_job) => {
      const today = new Date();
      const dayOfMonth = today.getDate();

      const templates = await prisma.cost.findMany({
        where: { isRecurring: true, recurringDay: dayOfMonth },
      });

      for (const tmpl of templates) {
        // Don't double-clone: check if already cloned this month
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        const alreadyCloned = await prisma.cost.findFirst({
          where: {
            parentCostId: tmpl.id,
            date: { gte: monthStart, lte: monthEnd },
          },
        });

        if (!alreadyCloned) {
          await prisma.cost.create({
            data: {
              orgId: tmpl.orgId,
              carId: tmpl.carId,
              category: tmpl.category,
              amountPaise: tmpl.amountPaise,
              date: today,
              description: tmpl.description,
              vendorName: tmpl.vendorName,
              isRecurring: false,
              parentCostId: tmpl.id,
            },
          });
          console.log(`[RecurringCost] Cloned cost ${tmpl.id} for car ${tmpl.carId}`);
        }
      }
    },
    CONNECTION
  );
}

// ── Document Expiry Job ───────────────────────────────────────────────────────
// Runs daily at 09:00 IST: creates notifications for expiring documents

export function startDocumentExpiryWorker() {
  return new Worker(
    "document-expiry",
    async (_job) => {
      const now = new Date();
      const in7Days = addDays(now, 7);
      const in30Days = addDays(now, 30);

      const expiringDocuments = await prisma.document.findMany({
        where: { expiryDate: { gte: now, lte: in30Days } },
        include: {
          car: { select: { orgId: true, registrationNumber: true } },
          driver: { select: { orgId: true, name: true } },
        },
      });

      for (const doc of expiringDocuments) {
        const orgId = doc.car?.orgId ?? doc.driver?.orgId;
        if (!orgId) continue;

        const entityName = doc.car?.registrationNumber ?? doc.driver?.name ?? "Unknown";
        const daysLeft = Math.ceil((doc.expiryDate!.getTime() - now.getTime()) / 86400000);
        const isCritical = daysLeft <= 7;

        // Check for existing notification (prevent spam)
        const existingNotif = await prisma.notification.findFirst({
          where: {
            orgId,
            entityId: doc.id,
            type: "DOCUMENT_EXPIRY",
            createdAt: { gte: addDays(now, -1) },
          },
        });

        if (!existingNotif) {
          await prisma.notification.create({
            data: {
              orgId,
              type: "DOCUMENT_EXPIRY",
              title: `${isCritical ? "⚠️ URGENT: " : ""}Document Expiring`,
              body: `${doc.type} for ${entityName} expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`,
              entityId: doc.id,
            },
          });
        }
      }

      console.log(`[DocumentExpiry] Checked ${expiringDocuments.length} expiring documents`);
    },
    CONNECTION
  );
}

// ── Settlement Reminder Job ───────────────────────────────────────────────────
// Runs on 25th of each month

export function startSettlementReminderWorker() {
  return new Worker(
    "settlement-reminder",
    async (_job) => {
      const orgs = await prisma.organisation.findMany({ select: { id: true } });

      for (const org of orgs) {
        const pendingDrivers = await prisma.driver.count({
          where: { orgId: org.id, status: "ACTIVE" },
        });

        if (pendingDrivers > 0) {
          await prisma.notification.create({
            data: {
              orgId: org.id,
              type: "SETTLEMENT_DUE",
              title: "Driver Settlements Due",
              body: `Monthly settlement is due for ${pendingDrivers} active driver(s). Process by month end.`,
            },
          });
        }
      }

      console.log("[SettlementReminder] Reminders sent to all orgs");
    },
    CONNECTION
  );
}

// ── Notification Worker ───────────────────────────────────────────────────────

export function startNotificationWorker() {
  return new Worker(
    "notifications",
    async (job) => {
      const { orgId, type, title, body, entityId } = job.data;
      await prisma.notification.create({ data: { orgId, type, title, body, entityId } });
      console.log(`[Notification] Created: ${title}`);
    },
    CONNECTION
  );
}
