export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface JwtPayload {
    sub: string;
    orgId: string;
    role: string;
    iat: number;
    exp: number;
}
export interface CarPnl {
    carId: string;
    registrationNumber: string;
    make: string;
    model: string;
    totalRevenuePaise: number;
    totalCostPaise: number;
    netProfitPaise: number;
    profitMarginPct: number;
    breakEvenRevenuePaise: number;
    depreciationPaise: number;
    monthlyData: MonthlyPnl[];
}
export interface MonthlyPnl {
    month: string;
    revenuePaise: number;
    costPaise: number;
    netProfitPaise: number;
}
export interface FleetPnl {
    period: string;
    totalRevenuePaise: number;
    totalCostPaise: number;
    netProfitPaise: number;
    cars: CarPnl[];
}
export interface DriverSettlement {
    driverId: string;
    driverName: string;
    month: string;
    grossEarningsPaise: number;
    advancesPaise: number;
    salaryDuePaise: number;
    netPayablePaise: number;
    breakdown: SettlementBreakdown;
}
export interface SettlementBreakdown {
    fixedComponent: number;
    percentageComponent: number;
    totalAdvanceDeductions: number;
}
export interface DashboardStats {
    totalCars: number;
    activeCars: number;
    monthlyRevenuePaise: number;
    monthlyProfitPaise: number;
    pendingSettlements: number;
    expiringDocuments: number;
}
export interface DocumentExpiry {
    id: string;
    entityType: "car" | "driver";
    entityId: string;
    entityName: string;
    documentType: string;
    expiryDate: string;
    daysUntilExpiry: number;
}
