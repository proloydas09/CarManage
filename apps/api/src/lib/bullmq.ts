import { Queue, Worker, QueueEvents } from "bullmq";
import { redis } from "./redis";

const CONNECTION = { connection: redis };

// ── Queue Definitions ─────────────────────────────────────────────────────────

export const recurringCostQueue = new Queue("recurring-cost", CONNECTION);
export const documentExpiryQueue = new Queue("document-expiry", CONNECTION);
export const reportExportQueue = new Queue("report-export", CONNECTION);
export const settlementReminderQueue = new Queue("settlement-reminder", CONNECTION);
export const notificationQueue = new Queue("notifications", CONNECTION);

// ── Job Data Types ────────────────────────────────────────────────────────────

export interface ReportExportJobData {
  orgId: string;
  reportType: "fleet-pnl" | "car-comparison" | "cost-breakdown" | "driver";
  startDate: string;
  endDate: string;
  requestedBy: string;
}

export interface NotificationJobData {
  orgId: string;
  type: string;
  title: string;
  body: string;
  entityId?: string;
  phone?: string;
}

// ── Helper to add jobs ────────────────────────────────────────────────────────

export async function enqueueReportExport(data: ReportExportJobData): Promise<string> {
  const job = await reportExportQueue.add("export", data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  });
  return job.id ?? "";
}

export async function enqueueNotification(data: NotificationJobData): Promise<void> {
  await notificationQueue.add("send", data, {
    attempts: 3,
    backoff: { type: "fixed", delay: 2000 },
  });
}
