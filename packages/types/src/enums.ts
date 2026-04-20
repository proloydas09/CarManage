// ─── Shared Enums ─────────────────────────────────────────────────────────────

export enum UserRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  VIEWER = "VIEWER",
}

export enum PlanTier {
  STARTER = "STARTER",   // 5 cars max
  GROWTH = "GROWTH",     // 25 cars max
  SCALE = "SCALE",       // unlimited
}

export enum CarStatus {
  ACTIVE = "ACTIVE",
  IDLE = "IDLE",
  IN_SERVICE = "IN_SERVICE",
  SOLD = "SOLD",
  SCRAPPED = "SCRAPPED",
}

export enum FuelType {
  PETROL = "PETROL",
  DIESEL = "DIESEL",
  CNG = "CNG",
  ELECTRIC = "ELECTRIC",
  HYBRID = "HYBRID",
}

export enum DepreciationMethod {
  STRAIGHT_LINE = "STRAIGHT_LINE",
  DECLINING_BALANCE = "DECLINING_BALANCE",
}

export enum CostCategory {
  FUEL = "FUEL",
  MAINTENANCE = "MAINTENANCE",
  INSURANCE = "INSURANCE",
  EMI = "EMI",
  DRIVER_SALARY = "DRIVER_SALARY",
  TOLL = "TOLL",
  PERMIT = "PERMIT",
  TAX = "TAX",
  CLEANING = "CLEANING",
  TYRE = "TYRE",
  SPARE_PARTS = "SPARE_PARTS",
  OTHER = "OTHER",
}

export enum EarningSource {
  BOOKING = "BOOKING",
  RENTAL = "RENTAL",
  SCHOOL_CONTRACT = "SCHOOL_CONTRACT",
  CORPORATE_CONTRACT = "CORPORATE_CONTRACT",
  OTHER = "OTHER",
}

export enum DriverStatus {
  ACTIVE = "ACTIVE",
  ON_LEAVE = "ON_LEAVE",
  TERMINATED = "TERMINATED",
}

export enum CompensationType {
  FIXED = "FIXED",       // Fixed monthly salary
  PERCENTAGE = "PERCENTAGE", // % of net earning
  HYBRID = "HYBRID",    // Fixed + % above threshold
}

export enum DocumentType {
  RC = "RC",
  INSURANCE = "INSURANCE",
  PERMIT = "PERMIT",
  FITNESS = "FITNESS",
  PUC = "PUC",
  ROAD_TAX = "ROAD_TAX",
  DRIVER_LICENSE = "DRIVER_LICENSE",
  DRIVER_AADHAR = "DRIVER_AADHAR",
  OTHER = "OTHER",
}

export enum BookingStatus {
  INQUIRY = "INQUIRY",
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum InvoiceStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
}

export enum SettlementStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  PAID = "PAID",
}

export enum NotificationType {
  DOCUMENT_EXPIRY = "DOCUMENT_EXPIRY",
  SETTLEMENT_DUE = "SETTLEMENT_DUE",
  BOOKING_REMINDER = "BOOKING_REMINDER",
  PLAN_LIMIT = "PLAN_LIMIT",
  PAYMENT_DUE = "PAYMENT_DUE",
  SYSTEM = "SYSTEM",
}

export const PLAN_CAR_LIMITS: Record<PlanTier, number> = {
  [PlanTier.STARTER]: 5,
  [PlanTier.GROWTH]: 25,
  [PlanTier.SCALE]: Infinity,
};
