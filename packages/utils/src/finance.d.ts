import { DepreciationMethod } from "@antigravity/types";
/**
 * Calculate net profit in paise.
 */
export declare function calculateNetProfit(revenuePaise: number, costPaise: number): number;
/**
 * Calculate profit margin as a percentage (0–100).
 */
export declare function calculateProfitMargin(revenuePaise: number, costPaise: number): number;
/**
 * Break-even revenue: the minimum revenue needed to cover all fixed costs.
 * For simplicity: break-even = total fixed costs (EMI, insurance, permit, etc.)
 */
export declare function calculateBreakEven(fixedCostsPaise: number, variableCostRatio: number): number;
/**
 * Net earning for driver settlement purposes.
 * Net earning = Revenue - Fuel costs - Toll costs - Driver salary
 */
export declare function calculateNetEarning(params: {
    revenuePaise: number;
    fuelCostPaise: number;
    tollCostPaise: number;
    otherVariablePaise?: number;
}): number;
/**
 * Calculate driver pay based on compensation type.
 */
export declare function calculateDriverPay(params: {
    compensationType: "FIXED" | "PERCENTAGE" | "HYBRID";
    netEarningPaise: number;
    fixedSalaryPaise?: number;
    percentageRate?: number;
    thresholdPaise?: number;
}): number;
/**
 * Calculate annual depreciation in paise.
 */
export declare function calculateDepreciation(params: {
    purchasePricePaise: number;
    purchaseDate: Date;
    method: DepreciationMethod;
    annualRatePct: number;
    asOfDate?: Date;
}): {
    annualPaise: number;
    monthlyPaise: number;
    totalAccumulatedPaise: number;
    bookValuePaise: number;
};
export declare function clamp(value: number, min: number, max: number): number;
export declare function roundToPaise(rupees: number): number;
export declare function percentage(part: number, total: number): number;
