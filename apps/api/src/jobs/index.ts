import { Queue } from "bullmq";
import { redis } from "../lib/redis";
import {
  startRecurringCostWorker,
  startDocumentExpiryWorker,
  startSettlementReminderWorker,
  startNotificationWorker,
} from "./workers";

const CONNECTION = { connection: redis };

export async function startJobs() {
  // Start all workers
  startRecurringCostWorker();
  startDocumentExpiryWorker();
  startSettlementReminderWorker();
  startNotificationWorker();

  // Schedule recurring jobs
  const recurringCostQueue = new Queue("recurring-cost", CONNECTION);
  const documentExpiryQueue = new Queue("document-expiry", CONNECTION);
  const settlementReminderQueue = new Queue("settlement-reminder", CONNECTION);

  // Daily recurring cost check at 00:05 IST
  await recurringCostQueue.upsertJobScheduler(
    "daily-recurring-cost",
    { pattern: "5 0 * * *", tz: "Asia/Kolkata" },
    { name: "check", data: {} }
  );

  // Daily document expiry check at 09:00 IST
  await documentExpiryQueue.upsertJobScheduler(
    "daily-document-expiry",
    { pattern: "0 9 * * *", tz: "Asia/Kolkata" },
    { name: "check", data: {} }
  );

  // Settlement reminder on 25th at 10:00 IST
  await settlementReminderQueue.upsertJobScheduler(
    "monthly-settlement-reminder",
    { pattern: "0 10 25 * *", tz: "Asia/Kolkata" },
    { name: "remind", data: {} }
  );

  console.log("⚙️  Background jobs scheduled");
}
