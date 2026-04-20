"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = formatDate;
exports.formatDateTime = formatDateTime;
exports.formatMonth = formatMonth;
exports.formatMonthKey = formatMonthKey;
exports.getDateRangeThisMonth = getDateRangeThisMonth;
exports.getDateRangeLastNMonths = getDateRangeLastNMonths;
exports.getDateRangeThisYear = getDateRangeThisYear;
exports.getDaysUntilExpiry = getDaysUntilExpiry;
exports.getExpiryStatus = getExpiryStatus;
exports.isExpired = isExpired;
exports.isExpiringSoon = isExpiringSoon;
exports.nowIST = nowIST;
const date_fns_1 = require("date-fns");
// ─── Date Formatting ──────────────────────────────────────────────────────────
function formatDate(date) {
    const d = typeof date === "string" ? (0, date_fns_1.parseISO)(date) : date;
    return (0, date_fns_1.format)(d, "dd MMM yyyy");
}
function formatDateTime(date) {
    const d = typeof date === "string" ? (0, date_fns_1.parseISO)(date) : date;
    return (0, date_fns_1.format)(d, "dd MMM yyyy, hh:mm a");
}
function formatMonth(date) {
    const d = typeof date === "string" ? (0, date_fns_1.parseISO)(date) : date;
    return (0, date_fns_1.format)(d, "MMM yyyy");
}
function formatMonthKey(date) {
    const d = typeof date === "string" ? (0, date_fns_1.parseISO)(date) : date;
    return (0, date_fns_1.format)(d, "yyyy-MM");
}
function getDateRangeThisMonth() {
    const now = new Date();
    return {
        startDate: (0, date_fns_1.startOfMonth)(now),
        endDate: (0, date_fns_1.endOfMonth)(now),
    };
}
function getDateRangeLastNMonths(n) {
    const now = new Date();
    return {
        startDate: (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(now, n - 1)),
        endDate: (0, date_fns_1.endOfMonth)(now),
    };
}
function getDateRangeThisYear() {
    const now = new Date();
    return {
        startDate: new Date(now.getFullYear(), 0, 1),
        endDate: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
    };
}
// ─── Document Expiry ─────────────────────────────────────────────────────────
function getDaysUntilExpiry(expiryDate) {
    const d = typeof expiryDate === "string" ? (0, date_fns_1.parseISO)(expiryDate) : expiryDate;
    return (0, date_fns_1.differenceInDays)(d, new Date());
}
function getExpiryStatus(expiryDate) {
    const days = getDaysUntilExpiry(expiryDate);
    if (days < 0)
        return "expired";
    if (days <= 7)
        return "critical";
    if (days <= 30)
        return "warning";
    return "ok";
}
function isExpired(date) {
    const d = typeof date === "string" ? (0, date_fns_1.parseISO)(date) : date;
    return (0, date_fns_1.isBefore)(d, new Date());
}
function isExpiringSoon(date, withinDays = 30) {
    const d = typeof date === "string" ? (0, date_fns_1.parseISO)(date) : date;
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + withinDays);
    return (0, date_fns_1.isAfter)(d, new Date()) && (0, date_fns_1.isBefore)(d, threshold);
}
// ─── IST Utilities ────────────────────────────────────────────────────────────
function nowIST() {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
}
