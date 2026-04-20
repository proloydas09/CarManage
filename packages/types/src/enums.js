"use strict";
// ─── Shared Enums ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_CAR_LIMITS = exports.NotificationType = exports.SettlementStatus = exports.InvoiceStatus = exports.BookingStatus = exports.DocumentType = exports.CompensationType = exports.DriverStatus = exports.EarningSource = exports.CostCategory = exports.DepreciationMethod = exports.FuelType = exports.CarStatus = exports.PlanTier = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["OWNER"] = "OWNER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["MANAGER"] = "MANAGER";
    UserRole["VIEWER"] = "VIEWER";
})(UserRole || (exports.UserRole = UserRole = {}));
var PlanTier;
(function (PlanTier) {
    PlanTier["STARTER"] = "STARTER";
    PlanTier["GROWTH"] = "GROWTH";
    PlanTier["SCALE"] = "SCALE";
})(PlanTier || (exports.PlanTier = PlanTier = {}));
var CarStatus;
(function (CarStatus) {
    CarStatus["ACTIVE"] = "ACTIVE";
    CarStatus["IDLE"] = "IDLE";
    CarStatus["IN_SERVICE"] = "IN_SERVICE";
    CarStatus["SOLD"] = "SOLD";
    CarStatus["SCRAPPED"] = "SCRAPPED";
})(CarStatus || (exports.CarStatus = CarStatus = {}));
var FuelType;
(function (FuelType) {
    FuelType["PETROL"] = "PETROL";
    FuelType["DIESEL"] = "DIESEL";
    FuelType["CNG"] = "CNG";
    FuelType["ELECTRIC"] = "ELECTRIC";
    FuelType["HYBRID"] = "HYBRID";
})(FuelType || (exports.FuelType = FuelType = {}));
var DepreciationMethod;
(function (DepreciationMethod) {
    DepreciationMethod["STRAIGHT_LINE"] = "STRAIGHT_LINE";
    DepreciationMethod["DECLINING_BALANCE"] = "DECLINING_BALANCE";
})(DepreciationMethod || (exports.DepreciationMethod = DepreciationMethod = {}));
var CostCategory;
(function (CostCategory) {
    CostCategory["FUEL"] = "FUEL";
    CostCategory["MAINTENANCE"] = "MAINTENANCE";
    CostCategory["INSURANCE"] = "INSURANCE";
    CostCategory["EMI"] = "EMI";
    CostCategory["DRIVER_SALARY"] = "DRIVER_SALARY";
    CostCategory["TOLL"] = "TOLL";
    CostCategory["PERMIT"] = "PERMIT";
    CostCategory["TAX"] = "TAX";
    CostCategory["CLEANING"] = "CLEANING";
    CostCategory["TYRE"] = "TYRE";
    CostCategory["SPARE_PARTS"] = "SPARE_PARTS";
    CostCategory["OTHER"] = "OTHER";
})(CostCategory || (exports.CostCategory = CostCategory = {}));
var EarningSource;
(function (EarningSource) {
    EarningSource["BOOKING"] = "BOOKING";
    EarningSource["RENTAL"] = "RENTAL";
    EarningSource["SCHOOL_CONTRACT"] = "SCHOOL_CONTRACT";
    EarningSource["CORPORATE_CONTRACT"] = "CORPORATE_CONTRACT";
    EarningSource["OTHER"] = "OTHER";
})(EarningSource || (exports.EarningSource = EarningSource = {}));
var DriverStatus;
(function (DriverStatus) {
    DriverStatus["ACTIVE"] = "ACTIVE";
    DriverStatus["ON_LEAVE"] = "ON_LEAVE";
    DriverStatus["TERMINATED"] = "TERMINATED";
})(DriverStatus || (exports.DriverStatus = DriverStatus = {}));
var CompensationType;
(function (CompensationType) {
    CompensationType["FIXED"] = "FIXED";
    CompensationType["PERCENTAGE"] = "PERCENTAGE";
    CompensationType["HYBRID"] = "HYBRID";
})(CompensationType || (exports.CompensationType = CompensationType = {}));
var DocumentType;
(function (DocumentType) {
    DocumentType["RC"] = "RC";
    DocumentType["INSURANCE"] = "INSURANCE";
    DocumentType["PERMIT"] = "PERMIT";
    DocumentType["FITNESS"] = "FITNESS";
    DocumentType["PUC"] = "PUC";
    DocumentType["ROAD_TAX"] = "ROAD_TAX";
    DocumentType["DRIVER_LICENSE"] = "DRIVER_LICENSE";
    DocumentType["DRIVER_AADHAR"] = "DRIVER_AADHAR";
    DocumentType["OTHER"] = "OTHER";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["INQUIRY"] = "INQUIRY";
    BookingStatus["CONFIRMED"] = "CONFIRMED";
    BookingStatus["IN_PROGRESS"] = "IN_PROGRESS";
    BookingStatus["COMPLETED"] = "COMPLETED";
    BookingStatus["CANCELLED"] = "CANCELLED";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "DRAFT";
    InvoiceStatus["SENT"] = "SENT";
    InvoiceStatus["PAID"] = "PAID";
    InvoiceStatus["OVERDUE"] = "OVERDUE";
    InvoiceStatus["CANCELLED"] = "CANCELLED";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
var SettlementStatus;
(function (SettlementStatus) {
    SettlementStatus["PENDING"] = "PENDING";
    SettlementStatus["APPROVED"] = "APPROVED";
    SettlementStatus["PAID"] = "PAID";
})(SettlementStatus || (exports.SettlementStatus = SettlementStatus = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["DOCUMENT_EXPIRY"] = "DOCUMENT_EXPIRY";
    NotificationType["SETTLEMENT_DUE"] = "SETTLEMENT_DUE";
    NotificationType["BOOKING_REMINDER"] = "BOOKING_REMINDER";
    NotificationType["PLAN_LIMIT"] = "PLAN_LIMIT";
    NotificationType["PAYMENT_DUE"] = "PAYMENT_DUE";
    NotificationType["SYSTEM"] = "SYSTEM";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
exports.PLAN_CAR_LIMITS = {
    [PlanTier.STARTER]: 5,
    [PlanTier.GROWTH]: 25,
    [PlanTier.SCALE]: Infinity,
};
