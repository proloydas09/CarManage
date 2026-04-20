import { z } from "zod";
import {
  UserRole, PlanTier, CarStatus, FuelType, DepreciationMethod,
  CostCategory, EarningSource, DriverStatus, CompensationType,
  DocumentType, BookingStatus, InvoiceStatus, SettlementStatus, NotificationType,
} from "./enums";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  orgName: z.string().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const OnboardingSchema = z.object({
  orgName: z.string().min(2).max(100),
  orgPhone: z.string().regex(/^[6-9]\d{9}$/),
  orgAddress: z.string().max(500).optional(),
  orgGst: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional(),
  plan: z.nativeEnum(PlanTier).optional(),
});

// ─── Car ─────────────────────────────────────────────────────────────────────

export const CreateCarSchema = z.object({
  registrationNumber: z.string().min(5).max(20),
  make: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  fuelType: z.nativeEnum(FuelType),
  status: z.nativeEnum(CarStatus).default(CarStatus.ACTIVE),
  purchasePrice: z.number().int().positive(), // paise
  purchaseDate: z.string().datetime(),
  depreciationMethod: z.nativeEnum(DepreciationMethod).default(DepreciationMethod.STRAIGHT_LINE),
  depreciationRate: z.number().min(0).max(100).default(20),
  currentOdometer: z.number().int().min(0).default(0),
  color: z.string().max(50).optional(),
  seatingCapacity: z.number().int().min(1).max(100).optional(),
  notes: z.string().max(2000).optional(),
});

export const UpdateCarSchema = CreateCarSchema.partial();

export const OdometerEntrySchema = z.object({
  reading: z.number().int().positive(),
  readingDate: z.string().datetime(),
  notes: z.string().max(500).optional(),
});

// ─── Cost ────────────────────────────────────────────────────────────────────

export const CreateCostSchema = z.object({
  carId: z.string().cuid(),
  category: z.nativeEnum(CostCategory),
  amountPaise: z.number().int().positive(), // paise
  date: z.string().datetime(),
  description: z.string().max(500).optional(),
  vendorName: z.string().max(200).optional(),
  receiptUrl: z.string().url().optional(),
  isRecurring: z.boolean().default(false),
  recurringDay: z.number().int().min(1).max(31).optional(),
});

export const UpdateCostSchema = CreateCostSchema.partial().omit({ carId: true });

export const BulkCreateCostSchema = z.object({
  costs: z.array(CreateCostSchema).min(1).max(100),
});

// ─── Earning ─────────────────────────────────────────────────────────────────

export const CreateEarningSchema = z.object({
  carId: z.string().cuid(),
  source: z.nativeEnum(EarningSource),
  amountPaise: z.number().int().positive(), // paise
  date: z.string().datetime(),
  customerId: z.string().cuid().optional(),
  bookingId: z.string().cuid().optional(),
  description: z.string().max(500).optional(),
  tripKm: z.number().min(0).optional(),
});

export const UpdateEarningSchema = CreateEarningSchema.partial().omit({ carId: true });

// ─── Driver ──────────────────────────────────────────────────────────────────

export const CreateDriverSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email().optional(),
  licenseNumber: z.string().min(5).max(30),
  licenseExpiry: z.string().datetime(),
  aadharNumber: z.string().regex(/^\d{12}$/).optional(),
  address: z.string().max(500).optional(),
  joiningDate: z.string().datetime(),
  status: z.nativeEnum(DriverStatus).default(DriverStatus.ACTIVE),
  compensationType: z.nativeEnum(CompensationType),
  fixedSalaryPaise: z.number().int().min(0).optional(),   // paise
  percentageRate: z.number().min(0).max(100).optional(),  // e.g. 10.5
  thresholdPaise: z.number().int().min(0).optional(),     // for HYBRID
  assignedCarId: z.string().cuid().optional(),
  notes: z.string().max(2000).optional(),
});

export const UpdateDriverSchema = CreateDriverSchema.partial();

export const DriverAdvanceSchema = z.object({
  amountPaise: z.number().int().positive(),
  date: z.string().datetime(),
  reason: z.string().max(500).optional(),
});

// ─── Booking ─────────────────────────────────────────────────────────────────

export const CreateBookingSchema = z.object({
  carId: z.string().cuid(),
  driverId: z.string().cuid().optional(),
  customerId: z.string().cuid().optional(),
  customerName: z.string().min(2).max(100).optional(),   // if no customer record
  customerPhone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  source: z.nativeEnum(EarningSource).default(EarningSource.BOOKING),
  status: z.nativeEnum(BookingStatus).default(BookingStatus.INQUIRY),
  pickupLocation: z.string().max(500),
  dropLocation: z.string().max(500).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  estimatedKm: z.number().min(0).optional(),
  quotedAmountPaise: z.number().int().positive(), // paise
  advancePaidPaise: z.number().int().min(0).default(0),
  notes: z.string().max(2000).optional(),
});

export const UpdateBookingSchema = CreateBookingSchema.partial();

export const CompleteBookingSchema = z.object({
  actualKm: z.number().min(0),
  finalAmountPaise: z.number().int().positive(),
  endOdometer: z.number().int().positive().optional(),
  notes: z.string().max(2000).optional(),
});

// ─── Customer ────────────────────────────────────────────────────────────────

export const CreateCustomerSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email().optional(),
  address: z.string().max(500).optional(),
  gstin: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();

// ─── Document ────────────────────────────────────────────────────────────────

export const CreateDocumentSchema = z.object({
  entityType: z.enum(["car", "driver"]),
  entityId: z.string().cuid(),
  type: z.nativeEnum(DocumentType),
  expiryDate: z.string().datetime().optional(),
  fileUrl: z.string().url().optional(),
  notes: z.string().max(500).optional(),
});

// ─── Report ──────────────────────────────────────────────────────────────────

export const ReportQuerySchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  carIds: z.array(z.string().cuid()).optional(),
});

// ─── Org ─────────────────────────────────────────────────────────────────────

export const UpdateOrgSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  address: z.string().max(500).optional(),
  gstin: z.string().optional(),
  logoUrl: z.string().url().optional(),
});

export const InviteUserSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
});

// ─── Pagination ──────────────────────────────────────────────────────────────

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ─── Inferred Types ──────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type OnboardingInput = z.infer<typeof OnboardingSchema>;
export type CreateCarInput = z.infer<typeof CreateCarSchema>;
export type UpdateCarInput = z.infer<typeof UpdateCarSchema>;
export type OdometerEntryInput = z.infer<typeof OdometerEntrySchema>;
export type CreateCostInput = z.infer<typeof CreateCostSchema>;
export type UpdateCostInput = z.infer<typeof UpdateCostSchema>;
export type BulkCreateCostInput = z.infer<typeof BulkCreateCostSchema>;
export type CreateEarningInput = z.infer<typeof CreateEarningSchema>;
export type UpdateEarningInput = z.infer<typeof UpdateEarningSchema>;
export type CreateDriverInput = z.infer<typeof CreateDriverSchema>;
export type UpdateDriverInput = z.infer<typeof UpdateDriverSchema>;
export type DriverAdvanceInput = z.infer<typeof DriverAdvanceSchema>;
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
export type UpdateBookingInput = z.infer<typeof UpdateBookingSchema>;
export type CompleteBookingInput = z.infer<typeof CompleteBookingSchema>;
export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;
export type CreateDocumentInput = z.infer<typeof CreateDocumentSchema>;
export type ReportQueryInput = z.infer<typeof ReportQuerySchema>;
export type UpdateOrgInput = z.infer<typeof UpdateOrgSchema>;
export type InviteUserInput = z.infer<typeof InviteUserSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
