import { DepreciationMethod } from "@antigravity/types";

// ─── P&L Calculations ─────────────────────────────────────────────────────────
// All monetary values in PAISE (integers) throughout

/**
 * Calculate net profit in paise.
 */
export function calculateNetProfit(revenuePaise: number, costPaise: number): number {
  return revenuePaise - costPaise;
}

/**
 * Calculate profit margin as a percentage (0–100).
 */
export function calculateProfitMargin(revenuePaise: number, costPaise: number): number {
  if (revenuePaise === 0) return 0;
  return ((revenuePaise - costPaise) / revenuePaise) * 100;
}

/**
 * Break-even revenue: the minimum revenue needed to cover all fixed costs.
 * For simplicity: break-even = total fixed costs (EMI, insurance, permit, etc.)
 */
export function calculateBreakEven(fixedCostsPaise: number, variableCostRatio: number): number {
  // Break-even = Fixed Costs / (1 - Variable Cost Ratio)
  if (variableCostRatio >= 1) return fixedCostsPaise;
  return Math.ceil(fixedCostsPaise / (1 - variableCostRatio));
}

// ─── Net Earning (Driver Settlement) ─────────────────────────────────────────

/**
 * Net earning for driver settlement purposes.
 * Net earning = Revenue - Fuel costs - Toll costs - Driver salary
 */
export function calculateNetEarning(params: {
  revenuePaise: number;
  fuelCostPaise: number;
  tollCostPaise: number;
  otherVariablePaise?: number;
}): number {
  const { revenuePaise, fuelCostPaise, tollCostPaise, otherVariablePaise = 0 } = params;
  return revenuePaise - fuelCostPaise - tollCostPaise - otherVariablePaise;
}

/**
 * Calculate driver pay based on compensation type.
 */
export function calculateDriverPay(params: {
  compensationType: "FIXED" | "PERCENTAGE" | "HYBRID";
  netEarningPaise: number;
  fixedSalaryPaise?: number;
  percentageRate?: number;  // e.g. 10.5 for 10.5%
  thresholdPaise?: number;  // for HYBRID: fixed below threshold, % above
}): number {
  const { compensationType, netEarningPaise, fixedSalaryPaise = 0, percentageRate = 0, thresholdPaise = 0 } = params;

  switch (compensationType) {
    case "FIXED":
      return fixedSalaryPaise;

    case "PERCENTAGE":
      return Math.floor((netEarningPaise * percentageRate) / 100);

    case "HYBRID": {
      if (netEarningPaise <= thresholdPaise) {
        return fixedSalaryPaise;
      }
      const aboveThreshold = netEarningPaise - thresholdPaise;
      return fixedSalaryPaise + Math.floor((aboveThreshold * percentageRate) / 100);
    }

    default:
      return 0;
  }
}

// ─── Depreciation ─────────────────────────────────────────────────────────────

/**
 * Calculate annual depreciation in paise.
 */
export function calculateDepreciation(params: {
  purchasePricePaise: number;
  purchaseDate: Date;
  method: DepreciationMethod;
  annualRatePct: number;  // e.g. 20 for 20%
  asOfDate?: Date;
}): { annualPaise: number; monthlyPaise: number; totalAccumulatedPaise: number; bookValuePaise: number } {
  const { purchasePricePaise, purchaseDate, method, annualRatePct, asOfDate = new Date() } = params;

  const yearsElapsed = Math.max(0,
    (asOfDate.getTime() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );

  let annualPaise: number;
  let bookValuePaise: number;

  if (method === DepreciationMethod.STRAIGHT_LINE) {
    annualPaise = Math.floor((purchasePricePaise * annualRatePct) / 100);
    const totalAccumulatedPaise = Math.min(
      Math.floor(annualPaise * yearsElapsed),
      purchasePricePaise
    );
    bookValuePaise = Math.max(0, purchasePricePaise - totalAccumulatedPaise);

    return {
      annualPaise,
      monthlyPaise: Math.floor(annualPaise / 12),
      totalAccumulatedPaise,
      bookValuePaise,
    };
  }

  // Declining balance
  const rate = annualRatePct / 100;
  bookValuePaise = Math.floor(purchasePricePaise * Math.pow(1 - rate, yearsElapsed));
  annualPaise = Math.floor(bookValuePaise * rate);
  const totalAccumulatedPaise = purchasePricePaise - bookValuePaise;

  return {
    annualPaise,
    monthlyPaise: Math.floor(annualPaise / 12),
    totalAccumulatedPaise,
    bookValuePaise,
  };
}

// ─── Utility ─────────────────────────────────────────────────────────────────

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function roundToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function percentage(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}
