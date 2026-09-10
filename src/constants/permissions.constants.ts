// src/constants/permissions.constants.ts
//
// The fixed set of backend modules a manager's access can be scoped to —
// mirrors the backend's permissionsSchema (auth.validation.js) exactly.
// A superadmin is never subject to these; only role "manager" is gated by
// them (see authorizePermission in the backend's authenticate.middleware.js).

export const PERMISSION_MODULES = [
  "vehicleManagement",
  "driverManagement",
  "bookingManagement",
  "paymentManagement",
  "reports",
  "settings",
  "userManagement",
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export const PERMISSION_LABELS: Record<PermissionModule, string> = {
  vehicleManagement: "Vehicles",
  driverManagement: "Drivers & trips",
  bookingManagement: "Bookings",
  paymentManagement: "Payments",
  reports: "Reports",
  settings: "Website (offers & tourist spots)",
  userManagement: "Users (view/edit driver & customer profiles)",
};

export const PERMISSION_DESCRIPTIONS: Record<PermissionModule, string> = {
  vehicleManagement: "Add, edit, and delete vehicles and vehicle categories.",
  driverManagement: "View and manage trips assigned to drivers.",
  bookingManagement: "Review, assign, confirm, and reject rental requests.",
  paymentManagement: "View payments, update status, and issue refunds.",
  reports: "View analytics and reports.",
  settings: "Manage offers and tourist spot listings on the public site.",
  userManagement: "View and edit driver and customer profile details.",
};

export type PermissionsMap = Partial<Record<PermissionModule, boolean>>;

export const emptyPermissions = (): PermissionsMap =>
  Object.fromEntries(PERMISSION_MODULES.map((m) => [m, false])) as PermissionsMap;
