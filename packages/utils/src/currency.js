"use strict";
// ─── Currency Formatting ──────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = formatCurrency;
exports.rupeesToPaise = rupeesToPaise;
exports.paiseToRupees = paiseToRupees;
exports.getProfitColor = getProfitColor;
exports.getProfitBgColor = getProfitBgColor;
/**
 * Convert paise (integer) to rupees string with Indian formatting.
 * e.g. 150000_00 → "₹1,50,000"
 */
function formatCurrency(paise, options) {
    const { showSymbol = true, compact = false } = options ?? {};
    const rupees = paise / 100;
    if (compact) {
        if (rupees >= 10_000_000) {
            return `${showSymbol ? "₹" : ""}${(rupees / 10_000_000).toFixed(2)}Cr`;
        }
        if (rupees >= 100_000) {
            return `${showSymbol ? "₹" : ""}${(rupees / 100_000).toFixed(2)}L`;
        }
        if (rupees >= 1_000) {
            return `${showSymbol ? "₹" : ""}${(rupees / 1_000).toFixed(1)}K`;
        }
    }
    const formatted = new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    }).format(rupees);
    return showSymbol ? `₹${formatted}` : formatted;
}
/**
 * Parse rupee string back to paise.
 */
function rupeesToPaise(rupees) {
    return Math.round(rupees * 100);
}
/**
 * Convert paise to rupees number.
 */
function paiseToRupees(paise) {
    return paise / 100;
}
function getProfitColor(paise) {
    if (paise > 0)
        return "text-emerald-400";
    if (paise < 0)
        return "text-red-400";
    return "text-slate-400";
}
function getProfitBgColor(paise) {
    if (paise > 0)
        return "bg-emerald-400/10 text-emerald-400";
    if (paise < 0)
        return "bg-red-400/10 text-red-400";
    return "bg-slate-400/10 text-slate-400";
}
