// ─── Currency Formatting ──────────────────────────────────────────────────────

/**
 * Convert paise (integer) to rupees string with Indian formatting.
 * e.g. 150000_00 → "₹1,50,000"
 */
export function formatCurrency(paise: number, options?: {
  showSymbol?: boolean;
  compact?: boolean;
}): string {
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
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Convert paise to rupees number.
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

// ─── Profit Color ─────────────────────────────────────────────────────────────

export type ProfitColorClass = "text-emerald-400" | "text-red-400" | "text-slate-400";

export function getProfitColor(paise: number): ProfitColorClass {
  if (paise > 0) return "text-emerald-400";
  if (paise < 0) return "text-red-400";
  return "text-slate-400";
}

export function getProfitBgColor(paise: number): string {
  if (paise > 0) return "bg-emerald-400/10 text-emerald-400";
  if (paise < 0) return "bg-red-400/10 text-red-400";
  return "bg-slate-400/10 text-slate-400";
}
