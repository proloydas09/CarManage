"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationSchema = exports.InviteUserSchema = exports.UpdateOrgSchema = exports.ReportQuerySchema = exports.CreateDocumentSchema = exports.UpdateCustomerSchema = exports.CreateCustomerSchema = exports.CompleteBookingSchema = exports.UpdateBookingSchema = exports.CreateBookingSchema = exports.DriverAdvanceSchema = exports.UpdateDriverSchema = exports.CreateDriverSchema = exports.UpdateEarningSchema = exports.CreateEarningSchema = exports.BulkCreateCostSchema = exports.UpdateCostSchema = exports.CreateCostSchema = exports.OdometerEntrySchema = exports.UpdateCarSchema = exports.CreateCarSchema = exports.OnboardingSchema = exports.RefreshTokenSchema = exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("./enums");
// ─── Auth ────────────────────────────────────────────────────────────────────
exports.RegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(100),
    orgName: zod_1.z.string().min(2).max(100),
    phone: zod_1.z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
exports.RefreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1),
});
exports.OnboardingSchema = zod_1.z.object({
    orgName: zod_1.z.string().min(2).max(100),
    orgPhone: zod_1.z.string().regex(/^[6-9]\d{9}$/),
    orgAddress: zod_1.z.string().max(500).optional(),
    orgGst: zod_1.z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional(),
    plan: zod_1.z.nativeEnum(enums_1.PlanTier).optional(),
});
// ─── Car ─────────────────────────────────────────────────────────────────────
exports.CreateCarSchema = zod_1.z.object({
    registrationNumber: zod_1.z.string().min(5).max(20),
    make: zod_1.z.string().min(1).max(100),
    model: zod_1.z.string().min(1).max(100),
    year: zod_1.z.number().int().min(1990).max(new Date().getFullYear() + 1),
    fuelType: zod_1.z.nativeEnum(enums_1.FuelType),
    status: zod_1.z.nativeEnum(enums_1.CarStatus).default(enums_1.CarStatus.ACTIVE),
    purchasePrice: zod_1.z.number().int().positive(), // paise
    purchaseDate: zod_1.z.string().datetime(),
    depreciationMethod: zod_1.z.nativeEnum(enums_1.DepreciationMethod).default(enums_1.DepreciationMethod.STRAIGHT_LINE),
    depreciationRate: zod_1.z.number().min(0).max(100).default(20),
    currentOdometer: zod_1.z.number().int().min(0).default(0),
    color: zod_1.z.string().max(50).optional(),
    seatingCapacity: zod_1.z.number().int().min(1).max(100).optional(),
    notes: zod_1.z.string().max(2000).optional(),
});
exports.UpdateCarSchema = exports.CreateCarSchema.partial();
exports.OdometerEntrySchema = zod_1.z.object({
    reading: zod_1.z.number().int().positive(),
    readingDate: zod_1.z.string().datetime(),
    notes: zod_1.z.string().max(500).optional(),
});
// ─── Cost ────────────────────────────────────────────────────────────────────
exports.CreateCostSchema = zod_1.z.object({
    carId: zod_1.z.string().cuid(),
    category: zod_1.z.nativeEnum(enums_1.CostCategory),
    amountPaise: zod_1.z.number().int().positive(), // paise
    date: zod_1.z.string().datetime(),
    description: zod_1.z.string().max(500).optional(),
    vendorName: zod_1.z.string().max(200).optional(),
    receiptUrl: zod_1.z.string().url().optional(),
    isRecurring: zod_1.z.boolean().default(false),
    recurringDay: zod_1.z.number().int().min(1).max(31).optional(),
});
exports.UpdateCostSchema = exports.CreateCostSchema.partial().omit({ carId: true });
exports.BulkCreateCostSchema = zod_1.z.object({
    costs: zod_1.z.array(exports.CreateCostSchema).min(1).max(100),
});
// ─── Earning ─────────────────────────────────────────────────────────────────
exports.CreateEarningSchema = zod_1.z.object({
    carId: zod_1.z.string().cuid(),
    source: zod_1.z.nativeEnum(enums_1.EarningSource),
    amountPaise: zod_1.z.number().int().positive(), // paise
    date: zod_1.z.string().datetime(),
    customerId: zod_1.z.string().cuid().optional(),
    bookingId: zod_1.z.string().cuid().optional(),
    description: zod_1.z.string().max(500).optional(),
    tripKm: zod_1.z.number().min(0).optional(),
});
exports.UpdateEarningSchema = exports.CreateEarningSchema.partial().omit({ carId: true });
// ─── Driver ──────────────────────────────────────────────────────────────────
exports.CreateDriverSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    phone: zod_1.z.string().regex(/^[6-9]\d{9}$/),
    email: zod_1.z.string().email().optional(),
    licenseNumber: zod_1.z.string().min(5).max(30),
    licenseExpiry: zod_1.z.string().datetime(),
    aadharNumber: zod_1.z.string().regex(/^\d{12}$/).optional(),
    address: zod_1.z.string().max(500).optional(),
    joiningDate: zod_1.z.string().datetime(),
    status: zod_1.z.nativeEnum(enums_1.DriverStatus).default(enums_1.DriverStatus.ACTIVE),
    compensationType: zod_1.z.nativeEnum(enums_1.CompensationType),
    fixedSalaryPaise: zod_1.z.number().int().min(0).optional(), // paise
    percentageRate: zod_1.z.number().min(0).max(100).optional(), // e.g. 10.5
    thresholdPaise: zod_1.z.number().int().min(0).optional(), // for HYBRID
    assignedCarId: zod_1.z.string().cuid().optional(),
    notes: zod_1.z.string().max(2000).optional(),
});
exports.UpdateDriverSchema = exports.CreateDriverSchema.partial();
exports.DriverAdvanceSchema = zod_1.z.object({
    amountPaise: zod_1.z.number().int().positive(),
    date: zod_1.z.string().datetime(),
    reason: zod_1.z.string().max(500).optional(),
});
// ─── Booking ─────────────────────────────────────────────────────────────────
exports.CreateBookingSchema = zod_1.z.object({
    carId: zod_1.z.string().cuid(),
    driverId: zod_1.z.string().cuid().optional(),
    customerId: zod_1.z.string().cuid().optional(),
    customerName: zod_1.z.string().min(2).max(100).optional(), // if no customer record
    customerPhone: zod_1.z.string().regex(/^[6-9]\d{9}$/).optional(),
    source: zod_1.z.nativeEnum(enums_1.EarningSource).default(enums_1.EarningSource.BOOKING),
    status: zod_1.z.nativeEnum(enums_1.BookingStatus).default(enums_1.BookingStatus.INQUIRY),
    pickupLocation: zod_1.z.string().max(500),
    dropLocation: zod_1.z.string().max(500).optional(),
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime().optional(),
    estimatedKm: zod_1.z.number().min(0).optional(),
    quotedAmountPaise: zod_1.z.number().int().positive(), // paise
    advancePaidPaise: zod_1.z.number().int().min(0).default(0),
    notes: zod_1.z.string().max(2000).optional(),
});
exports.UpdateBookingSchema = exports.CreateBookingSchema.partial();
exports.CompleteBookingSchema = zod_1.z.object({
    actualKm: zod_1.z.number().min(0),
    finalAmountPaise: zod_1.z.number().int().positive(),
    endOdometer: zod_1.z.number().int().positive().optional(),
    notes: zod_1.z.string().max(2000).optional(),
});
// ─── Customer ────────────────────────────────────────────────────────────────
exports.CreateCustomerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    phone: zod_1.z.string().regex(/^[6-9]\d{9}$/),
    email: zod_1.z.string().email().optional(),
    address: zod_1.z.string().max(500).optional(),
    gstin: zod_1.z.string().optional(),
    notes: zod_1.z.string().max(2000).optional(),
});
exports.UpdateCustomerSchema = exports.CreateCustomerSchema.partial();
// ─── Document ────────────────────────────────────────────────────────────────
exports.CreateDocumentSchema = zod_1.z.object({
    entityType: zod_1.z.enum(["car", "driver"]),
    entityId: zod_1.z.string().cuid(),
    type: zod_1.z.nativeEnum(enums_1.DocumentType),
    expiryDate: zod_1.z.string().datetime().optional(),
    fileUrl: zod_1.z.string().url().optional(),
    notes: zod_1.z.string().max(500).optional(),
});
// ─── Report ──────────────────────────────────────────────────────────────────
exports.ReportQuerySchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
    carIds: zod_1.z.array(zod_1.z.string().cuid()).optional(),
});
// ─── Org ─────────────────────────────────────────────────────────────────────
exports.UpdateOrgSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    phone: zod_1.z.string().regex(/^[6-9]\d{9}$/).optional(),
    address: zod_1.z.string().max(500).optional(),
    gstin: zod_1.z.string().optional(),
    logoUrl: zod_1.z.string().url().optional(),
});
exports.InviteUserSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    role: zod_1.z.nativeEnum(enums_1.UserRole),
});
// ─── Pagination ──────────────────────────────────────────────────────────────
exports.PaginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    search: zod_1.z.string().max(100).optional(),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
