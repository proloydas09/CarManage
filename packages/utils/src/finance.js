"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateNetProfit = calculateNetProfit;
exports.calculateProfitMargin = calculateProfitMargin;
exports.calculateBreakEven = calculateBreakEven;
exports.calculateNetEarning = calculateNetEarning;
exports.calculateDriverPay = calculateDriverPay;
exports.calculateDepreciation = calculateDepreciation;
exports.clamp = clamp;
exports.roundToPaise = roundToPaise;
exports.percentage = percentage;
const types_1 = require("@antigravity/types");
// ─── P&L Calculations ─────────────────────────────────────────────────────────
// All monetary values in PAISE (integers) throughout
/**
 * Calculate net profit in paise.
 */
function calculateNetProfit(revenuePaise, costPaise) {
    return revenuePaise - costPaise;
}
/**
 * Calculate profit margin as a percentage (0–100).
 */
function calculateProfitMargin(revenuePaise, costPaise) {
    if (revenuePaise === 0)
        return 0;
    return ((revenuePaise - costPaise) / revenuePaise) * 100;
}
/**
 * Break-even revenue: the minimum revenue needed to cover all fixed costs.
 * For simplicity: break-even = total fixed costs (EMI, insurance, permit, etc.)
 */
function calculateBreakEven(fixedCostsPaise, variableCostRatio) {
    // Break-even = Fixed Costs / (1 - Variable Cost Ratio)
    if (variableCostRatio >= 1)
        return fixedCostsPaise;
    return Math.ceil(fixedCostsPaise / (1 - variableCostRatio));
}
// ─── Net Earning (Driver Settlement) ─────────────────────────────────────────
/**
 * Net earning for driver settlement purposes.
 * Net earning = Revenue - Fuel costs - Toll costs - Driver salary
 */
function calculateNetEarning(params) {
    const { revenuePaise, fuelCostPaise, tollCostPaise, otherVariablePaise = 0 } = params;
    return revenuePaise - fuelCostPaise - tollCostPaise - otherVariablePaise;
}
/**
 * Calculate driver pay based on compensation type.
 */
function calculateDriverPay(params) {
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
function calculateDepreciation(params) {
    const { purchasePricePaise, purchaseDate, method, annualRatePct, asOfDate = new Date() } = params;
    const yearsElapsed = Math.max(0, (asOfDate.getTime() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    let annualPaise;
    let bookValuePaise;
    if (method === types_1.DepreciationMethod.STRAIGHT_LINE) {
        annualPaise = Math.floor((purchasePricePaise * annualRatePct) / 100);
        const totalAccumulatedPaise = Math.min(Math.floor(annualPaise * yearsElapsed), purchasePricePaise);
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
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function roundToPaise(rupees) {
    return Math.round(rupees * 100);
}
function percentage(part, total) {
    if (total === 0)
        return 0;
    return (part / total) * 100;
}
