export declare function formatDate(date: string | Date): string;
export declare function formatDateTime(date: string | Date): string;
export declare function formatMonth(date: string | Date): string;
export declare function formatMonthKey(date: string | Date): string;
export interface DateRange {
    startDate: Date;
    endDate: Date;
}
export declare function getDateRangeThisMonth(): DateRange;
export declare function getDateRangeLastNMonths(n: number): DateRange;
export declare function getDateRangeThisYear(): DateRange;
export declare function getDaysUntilExpiry(expiryDate: string | Date): number;
export declare function getExpiryStatus(expiryDate: string | Date): "expired" | "critical" | "warning" | "ok";
export declare function isExpired(date: string | Date): boolean;
export declare function isExpiringSoon(date: string | Date, withinDays?: number): boolean;
export declare function nowIST(): Date;
