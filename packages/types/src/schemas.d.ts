import { z } from "zod";
import { UserRole, PlanTier, CarStatus, FuelType, DepreciationMethod, CostCategory, EarningSource, DriverStatus, CompensationType, DocumentType, BookingStatus } from "./enums";
export declare const RegisterSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    orgName: z.ZodString;
    phone: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    phone: string;
    email: string;
    password: string;
    orgName: string;
}, {
    name: string;
    phone: string;
    email: string;
    password: string;
    orgName: string;
}>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const RefreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const OnboardingSchema: z.ZodObject<{
    orgName: z.ZodString;
    orgPhone: z.ZodString;
    orgAddress: z.ZodOptional<z.ZodString>;
    orgGst: z.ZodOptional<z.ZodString>;
    plan: z.ZodOptional<z.ZodNativeEnum<typeof PlanTier>>;
}, "strip", z.ZodTypeAny, {
    orgName: string;
    orgPhone: string;
    plan?: PlanTier | undefined;
    orgAddress?: string | undefined;
    orgGst?: string | undefined;
}, {
    orgName: string;
    orgPhone: string;
    plan?: PlanTier | undefined;
    orgAddress?: string | undefined;
    orgGst?: string | undefined;
}>;
export declare const CreateCarSchema: z.ZodObject<{
    registrationNumber: z.ZodString;
    make: z.ZodString;
    model: z.ZodString;
    year: z.ZodNumber;
    fuelType: z.ZodNativeEnum<typeof FuelType>;
    status: z.ZodDefault<z.ZodNativeEnum<typeof CarStatus>>;
    purchasePrice: z.ZodNumber;
    purchaseDate: z.ZodString;
    depreciationMethod: z.ZodDefault<z.ZodNativeEnum<typeof DepreciationMethod>>;
    depreciationRate: z.ZodDefault<z.ZodNumber>;
    currentOdometer: z.ZodDefault<z.ZodNumber>;
    color: z.ZodOptional<z.ZodString>;
    seatingCapacity: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    model: string;
    registrationNumber: string;
    make: string;
    year: number;
    fuelType: FuelType;
    status: CarStatus;
    purchaseDate: string;
    depreciationMethod: DepreciationMethod;
    depreciationRate: number;
    currentOdometer: number;
    purchasePrice: number;
    color?: string | undefined;
    seatingCapacity?: number | undefined;
    notes?: string | undefined;
}, {
    model: string;
    registrationNumber: string;
    make: string;
    year: number;
    fuelType: FuelType;
    purchaseDate: string;
    purchasePrice: number;
    status?: CarStatus | undefined;
    depreciationMethod?: DepreciationMethod | undefined;
    depreciationRate?: number | undefined;
    currentOdometer?: number | undefined;
    color?: string | undefined;
    seatingCapacity?: number | undefined;
    notes?: string | undefined;
}>;
export declare const UpdateCarSchema: z.ZodObject<{
    registrationNumber: z.ZodOptional<z.ZodString>;
    make: z.ZodOptional<z.ZodString>;
    model: z.ZodOptional<z.ZodString>;
    year: z.ZodOptional<z.ZodNumber>;
    fuelType: z.ZodOptional<z.ZodNativeEnum<typeof FuelType>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodNativeEnum<typeof CarStatus>>>;
    purchasePrice: z.ZodOptional<z.ZodNumber>;
    purchaseDate: z.ZodOptional<z.ZodString>;
    depreciationMethod: z.ZodOptional<z.ZodDefault<z.ZodNativeEnum<typeof DepreciationMethod>>>;
    depreciationRate: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    currentOdometer: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    color: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    seatingCapacity: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    model?: string | undefined;
    registrationNumber?: string | undefined;
    make?: string | undefined;
    year?: number | undefined;
    fuelType?: FuelType | undefined;
    status?: CarStatus | undefined;
    purchaseDate?: string | undefined;
    depreciationMethod?: DepreciationMethod | undefined;
    depreciationRate?: number | undefined;
    currentOdometer?: number | undefined;
    color?: string | undefined;
    seatingCapacity?: number | undefined;
    notes?: string | undefined;
    purchasePrice?: number | undefined;
}, {
    model?: string | undefined;
    registrationNumber?: string | undefined;
    make?: string | undefined;
    year?: number | undefined;
    fuelType?: FuelType | undefined;
    status?: CarStatus | undefined;
    purchaseDate?: string | undefined;
    depreciationMethod?: DepreciationMethod | undefined;
    depreciationRate?: number | undefined;
    currentOdometer?: number | undefined;
    color?: string | undefined;
    seatingCapacity?: number | undefined;
    notes?: string | undefined;
    purchasePrice?: number | undefined;
}>;
export declare const OdometerEntrySchema: z.ZodObject<{
    reading: z.ZodNumber;
    readingDate: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reading: number;
    readingDate: string;
    notes?: string | undefined;
}, {
    reading: number;
    readingDate: string;
    notes?: string | undefined;
}>;
export declare const CreateCostSchema: z.ZodObject<{
    carId: z.ZodString;
    category: z.ZodNativeEnum<typeof CostCategory>;
    amountPaise: z.ZodNumber;
    date: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    vendorName: z.ZodOptional<z.ZodString>;
    receiptUrl: z.ZodOptional<z.ZodString>;
    isRecurring: z.ZodDefault<z.ZodBoolean>;
    recurringDay: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    carId: string;
    category: CostCategory;
    amountPaise: number;
    date: string;
    isRecurring: boolean;
    description?: string | undefined;
    vendorName?: string | undefined;
    receiptUrl?: string | undefined;
    recurringDay?: number | undefined;
}, {
    carId: string;
    category: CostCategory;
    amountPaise: number;
    date: string;
    description?: string | undefined;
    vendorName?: string | undefined;
    receiptUrl?: string | undefined;
    isRecurring?: boolean | undefined;
    recurringDay?: number | undefined;
}>;
export declare const UpdateCostSchema: z.ZodObject<Omit<{
    carId: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodNativeEnum<typeof CostCategory>>;
    amountPaise: z.ZodOptional<z.ZodNumber>;
    date: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    vendorName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    receiptUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isRecurring: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    recurringDay: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
}, "carId">, "strip", z.ZodTypeAny, {
    category?: CostCategory | undefined;
    amountPaise?: number | undefined;
    date?: string | undefined;
    description?: string | undefined;
    vendorName?: string | undefined;
    receiptUrl?: string | undefined;
    isRecurring?: boolean | undefined;
    recurringDay?: number | undefined;
}, {
    category?: CostCategory | undefined;
    amountPaise?: number | undefined;
    date?: string | undefined;
    description?: string | undefined;
    vendorName?: string | undefined;
    receiptUrl?: string | undefined;
    isRecurring?: boolean | undefined;
    recurringDay?: number | undefined;
}>;
export declare const BulkCreateCostSchema: z.ZodObject<{
    costs: z.ZodArray<z.ZodObject<{
        carId: z.ZodString;
        category: z.ZodNativeEnum<typeof CostCategory>;
        amountPaise: z.ZodNumber;
        date: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        vendorName: z.ZodOptional<z.ZodString>;
        receiptUrl: z.ZodOptional<z.ZodString>;
        isRecurring: z.ZodDefault<z.ZodBoolean>;
        recurringDay: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        carId: string;
        category: CostCategory;
        amountPaise: number;
        date: string;
        isRecurring: boolean;
        description?: string | undefined;
        vendorName?: string | undefined;
        receiptUrl?: string | undefined;
        recurringDay?: number | undefined;
    }, {
        carId: string;
        category: CostCategory;
        amountPaise: number;
        date: string;
        description?: string | undefined;
        vendorName?: string | undefined;
        receiptUrl?: string | undefined;
        isRecurring?: boolean | undefined;
        recurringDay?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    costs: {
        carId: string;
        category: CostCategory;
        amountPaise: number;
        date: string;
        isRecurring: boolean;
        description?: string | undefined;
        vendorName?: string | undefined;
        receiptUrl?: string | undefined;
        recurringDay?: number | undefined;
    }[];
}, {
    costs: {
        carId: string;
        category: CostCategory;
        amountPaise: number;
        date: string;
        description?: string | undefined;
        vendorName?: string | undefined;
        receiptUrl?: string | undefined;
        isRecurring?: boolean | undefined;
        recurringDay?: number | undefined;
    }[];
}>;
export declare const CreateEarningSchema: z.ZodObject<{
    carId: z.ZodString;
    source: z.ZodNativeEnum<typeof EarningSource>;
    amountPaise: z.ZodNumber;
    date: z.ZodString;
    customerId: z.ZodOptional<z.ZodString>;
    bookingId: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    tripKm: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    carId: string;
    source: EarningSource;
    amountPaise: number;
    date: string;
    customerId?: string | undefined;
    description?: string | undefined;
    bookingId?: string | undefined;
    tripKm?: number | undefined;
}, {
    carId: string;
    source: EarningSource;
    amountPaise: number;
    date: string;
    customerId?: string | undefined;
    description?: string | undefined;
    bookingId?: string | undefined;
    tripKm?: number | undefined;
}>;
export declare const UpdateEarningSchema: z.ZodObject<Omit<{
    carId: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodNativeEnum<typeof EarningSource>>;
    amountPaise: z.ZodOptional<z.ZodNumber>;
    date: z.ZodOptional<z.ZodString>;
    customerId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    bookingId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    tripKm: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
}, "carId">, "strip", z.ZodTypeAny, {
    customerId?: string | undefined;
    source?: EarningSource | undefined;
    amountPaise?: number | undefined;
    date?: string | undefined;
    description?: string | undefined;
    bookingId?: string | undefined;
    tripKm?: number | undefined;
}, {
    customerId?: string | undefined;
    source?: EarningSource | undefined;
    amountPaise?: number | undefined;
    date?: string | undefined;
    description?: string | undefined;
    bookingId?: string | undefined;
    tripKm?: number | undefined;
}>;
export declare const CreateDriverSchema: z.ZodObject<{
    name: z.ZodString;
    phone: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    licenseNumber: z.ZodString;
    licenseExpiry: z.ZodString;
    aadharNumber: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    joiningDate: z.ZodString;
    status: z.ZodDefault<z.ZodNativeEnum<typeof DriverStatus>>;
    compensationType: z.ZodNativeEnum<typeof CompensationType>;
    fixedSalaryPaise: z.ZodOptional<z.ZodNumber>;
    percentageRate: z.ZodOptional<z.ZodNumber>;
    thresholdPaise: z.ZodOptional<z.ZodNumber>;
    assignedCarId: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    phone: string;
    status: DriverStatus;
    licenseNumber: string;
    licenseExpiry: string;
    joiningDate: string;
    compensationType: CompensationType;
    email?: string | undefined;
    address?: string | undefined;
    notes?: string | undefined;
    assignedCarId?: string | undefined;
    aadharNumber?: string | undefined;
    fixedSalaryPaise?: number | undefined;
    percentageRate?: number | undefined;
    thresholdPaise?: number | undefined;
}, {
    name: string;
    phone: string;
    licenseNumber: string;
    licenseExpiry: string;
    joiningDate: string;
    compensationType: CompensationType;
    email?: string | undefined;
    address?: string | undefined;
    status?: DriverStatus | undefined;
    notes?: string | undefined;
    assignedCarId?: string | undefined;
    aadharNumber?: string | undefined;
    fixedSalaryPaise?: number | undefined;
    percentageRate?: number | undefined;
    thresholdPaise?: number | undefined;
}>;
export declare const UpdateDriverSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    licenseNumber: z.ZodOptional<z.ZodString>;
    licenseExpiry: z.ZodOptional<z.ZodString>;
    aadharNumber: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    address: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    joiningDate: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodDefault<z.ZodNativeEnum<typeof DriverStatus>>>;
    compensationType: z.ZodOptional<z.ZodNativeEnum<typeof CompensationType>>;
    fixedSalaryPaise: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    percentageRate: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    thresholdPaise: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    assignedCarId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    phone?: string | undefined;
    email?: string | undefined;
    address?: string | undefined;
    status?: DriverStatus | undefined;
    notes?: string | undefined;
    assignedCarId?: string | undefined;
    licenseNumber?: string | undefined;
    licenseExpiry?: string | undefined;
    aadharNumber?: string | undefined;
    joiningDate?: string | undefined;
    compensationType?: CompensationType | undefined;
    fixedSalaryPaise?: number | undefined;
    percentageRate?: number | undefined;
    thresholdPaise?: number | undefined;
}, {
    name?: string | undefined;
    phone?: string | undefined;
    email?: string | undefined;
    address?: string | undefined;
    status?: DriverStatus | undefined;
    notes?: string | undefined;
    assignedCarId?: string | undefined;
    licenseNumber?: string | undefined;
    licenseExpiry?: string | undefined;
    aadharNumber?: string | undefined;
    joiningDate?: string | undefined;
    compensationType?: CompensationType | undefined;
    fixedSalaryPaise?: number | undefined;
    percentageRate?: number | undefined;
    thresholdPaise?: number | undefined;
}>;
export declare const DriverAdvanceSchema: z.ZodObject<{
    amountPaise: z.ZodNumber;
    date: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    amountPaise: number;
    date: string;
    reason?: string | undefined;
}, {
    amountPaise: number;
    date: string;
    reason?: string | undefined;
}>;
export declare const CreateBookingSchema: z.ZodObject<{
    carId: z.ZodString;
    driverId: z.ZodOptional<z.ZodString>;
    customerId: z.ZodOptional<z.ZodString>;
    customerName: z.ZodOptional<z.ZodString>;
    customerPhone: z.ZodOptional<z.ZodString>;
    source: z.ZodDefault<z.ZodNativeEnum<typeof EarningSource>>;
    status: z.ZodDefault<z.ZodNativeEnum<typeof BookingStatus>>;
    pickupLocation: z.ZodString;
    dropLocation: z.ZodOptional<z.ZodString>;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
    estimatedKm: z.ZodOptional<z.ZodNumber>;
    quotedAmountPaise: z.ZodNumber;
    advancePaidPaise: z.ZodDefault<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: BookingStatus;
    carId: string;
    source: EarningSource;
    pickupLocation: string;
    startDate: string;
    quotedAmountPaise: number;
    advancePaidPaise: number;
    notes?: string | undefined;
    driverId?: string | undefined;
    customerId?: string | undefined;
    customerName?: string | undefined;
    customerPhone?: string | undefined;
    dropLocation?: string | undefined;
    endDate?: string | undefined;
    estimatedKm?: number | undefined;
}, {
    carId: string;
    pickupLocation: string;
    startDate: string;
    quotedAmountPaise: number;
    status?: BookingStatus | undefined;
    notes?: string | undefined;
    driverId?: string | undefined;
    customerId?: string | undefined;
    customerName?: string | undefined;
    customerPhone?: string | undefined;
    source?: EarningSource | undefined;
    dropLocation?: string | undefined;
    endDate?: string | undefined;
    estimatedKm?: number | undefined;
    advancePaidPaise?: number | undefined;
}>;
export declare const UpdateBookingSchema: z.ZodObject<{
    carId: z.ZodOptional<z.ZodString>;
    driverId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    customerId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    customerName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    customerPhone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    source: z.ZodOptional<z.ZodDefault<z.ZodNativeEnum<typeof EarningSource>>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodNativeEnum<typeof BookingStatus>>>;
    pickupLocation: z.ZodOptional<z.ZodString>;
    dropLocation: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    estimatedKm: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    quotedAmountPaise: z.ZodOptional<z.ZodNumber>;
    advancePaidPaise: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: BookingStatus | undefined;
    notes?: string | undefined;
    carId?: string | undefined;
    driverId?: string | undefined;
    customerId?: string | undefined;
    customerName?: string | undefined;
    customerPhone?: string | undefined;
    source?: EarningSource | undefined;
    pickupLocation?: string | undefined;
    dropLocation?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    estimatedKm?: number | undefined;
    quotedAmountPaise?: number | undefined;
    advancePaidPaise?: number | undefined;
}, {
    status?: BookingStatus | undefined;
    notes?: string | undefined;
    carId?: string | undefined;
    driverId?: string | undefined;
    customerId?: string | undefined;
    customerName?: string | undefined;
    customerPhone?: string | undefined;
    source?: EarningSource | undefined;
    pickupLocation?: string | undefined;
    dropLocation?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    estimatedKm?: number | undefined;
    quotedAmountPaise?: number | undefined;
    advancePaidPaise?: number | undefined;
}>;
export declare const CompleteBookingSchema: z.ZodObject<{
    actualKm: z.ZodNumber;
    finalAmountPaise: z.ZodNumber;
    endOdometer: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    actualKm: number;
    finalAmountPaise: number;
    notes?: string | undefined;
    endOdometer?: number | undefined;
}, {
    actualKm: number;
    finalAmountPaise: number;
    notes?: string | undefined;
    endOdometer?: number | undefined;
}>;
export declare const CreateCustomerSchema: z.ZodObject<{
    name: z.ZodString;
    phone: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    gstin: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    phone: string;
    email?: string | undefined;
    address?: string | undefined;
    gstin?: string | undefined;
    notes?: string | undefined;
}, {
    name: string;
    phone: string;
    email?: string | undefined;
    address?: string | undefined;
    gstin?: string | undefined;
    notes?: string | undefined;
}>;
export declare const UpdateCustomerSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    address: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    gstin: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    phone?: string | undefined;
    email?: string | undefined;
    address?: string | undefined;
    gstin?: string | undefined;
    notes?: string | undefined;
}, {
    name?: string | undefined;
    phone?: string | undefined;
    email?: string | undefined;
    address?: string | undefined;
    gstin?: string | undefined;
    notes?: string | undefined;
}>;
export declare const CreateDocumentSchema: z.ZodObject<{
    entityType: z.ZodEnum<["car", "driver"]>;
    entityId: z.ZodString;
    type: z.ZodNativeEnum<typeof DocumentType>;
    expiryDate: z.ZodOptional<z.ZodString>;
    fileUrl: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: DocumentType;
    entityId: string;
    entityType: "car" | "driver";
    notes?: string | undefined;
    expiryDate?: string | undefined;
    fileUrl?: string | undefined;
}, {
    type: DocumentType;
    entityId: string;
    entityType: "car" | "driver";
    notes?: string | undefined;
    expiryDate?: string | undefined;
    fileUrl?: string | undefined;
}>;
export declare const ReportQuerySchema: z.ZodObject<{
    startDate: z.ZodString;
    endDate: z.ZodString;
    carIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    startDate: string;
    endDate: string;
    carIds?: string[] | undefined;
}, {
    startDate: string;
    endDate: string;
    carIds?: string[] | undefined;
}>;
export declare const UpdateOrgSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    gstin: z.ZodOptional<z.ZodString>;
    logoUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    gstin?: string | undefined;
    logoUrl?: string | undefined;
}, {
    name?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    gstin?: string | undefined;
    logoUrl?: string | undefined;
}>;
export declare const InviteUserSchema: z.ZodObject<{
    email: z.ZodString;
    role: z.ZodNativeEnum<typeof UserRole>;
}, "strip", z.ZodTypeAny, {
    email: string;
    role: UserRole;
}, {
    email: string;
    role: UserRole;
}>;
export declare const PaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    sortBy?: string | undefined;
}, {
    search?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
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
