/**
 * Convert paise (integer) to rupees string with Indian formatting.
 * e.g. 150000_00 → "₹1,50,000"
 */
export declare function formatCurrency(paise: number, options?: {
    showSymbol?: boolean;
    compact?: boolean;
}): string;
/**
 * Parse rupee string back to paise.
 */
export declare function rupeesToPaise(rupees: number): number;
/**
 * Convert paise to rupees number.
 */
export declare function paiseToRupees(paise: number): number;
export type ProfitColorClass = "text-emerald-400" | "text-red-400" | "text-slate-400";
export declare function getProfitColor(paise: number): ProfitColorClass;
export declare function getProfitBgColor(paise: number): string;
