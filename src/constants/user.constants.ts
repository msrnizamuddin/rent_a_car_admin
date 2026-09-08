// src/constants/user.constants.ts

export const DRIVER_STATUSES = [
  "pending",
  "approved",
  "available",
  "assigned",
  "on-trip",
  "offline",
] as const;

export const CENTRAL_STATUSES = ["active", "inactive", "suspended", "blocked"] as const;
