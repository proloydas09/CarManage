import { format, parseISO, startOfMonth, endOfMonth, subMonths, isAfter, isBefore, differenceInDays } from "date-fns";

// ─── Date Formatting ──────────────────────────────────────────────────────────

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd MMM yyyy");
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd MMM yyyy, hh:mm a");
}

export function formatMonth(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM yyyy");
}

export function formatMonthKey(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "yyyy-MM");
}

// ─── Date Ranges ─────────────────────────────────────────────────────────────

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export function getDateRangeThisMonth(): DateRange {
  const now = new Date();
  return {
    startDate: startOfMonth(now),
    endDate: endOfMonth(now),
  };
}

export function getDateRangeLastNMonths(n: number): DateRange {
  const now = new Date();
  return {
    startDate: startOfMonth(subMonths(now, n - 1)),
    endDate: endOfMonth(now),
  };
}

export function getDateRangeThisYear(): DateRange {
  const now = new Date();
  return {
    startDate: new Date(now.getFullYear(), 0, 1),
    endDate: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
  };
}

// ─── Document Expiry ─────────────────────────────────────────────────────────

export function getDaysUntilExpiry(expiryDate: string | Date): number {
  const d = typeof expiryDate === "string" ? parseISO(expiryDate) : expiryDate;
  return differenceInDays(d, new Date());
}

export function getExpiryStatus(expiryDate: string | Date): "expired" | "critical" | "warning" | "ok" {
  const days = getDaysUntilExpiry(expiryDate);
  if (days < 0) return "expired";
  if (days <= 7) return "critical";
  if (days <= 30) return "warning";
  return "ok";
}

export function isExpired(date: string | Date): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;
  return isBefore(d, new Date());
}

export function isExpiringSoon(date: string | Date, withinDays = 30): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + withinDays);
  return isAfter(d, new Date()) && isBefore(d, threshold);
}

// ─── IST Utilities ────────────────────────────────────────────────────────────

export function nowIST(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
}
