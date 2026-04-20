// ─── API Response Types ───────────────────────────────────────────────────────

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

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;    // userId
  orgId: string;
  role: string;
  iat: number;
  exp: number;
}

// ─── P&L Types ───────────────────────────────────────────────────────────────

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
  month: string;          // "2024-01"
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

// ─── Settlement Types ─────────────────────────────────────────────────────────

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

// ─── Dashboard Types ──────────────────────────────────────────────────────────

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
