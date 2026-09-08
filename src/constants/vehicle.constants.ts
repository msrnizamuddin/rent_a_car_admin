// src/constants/vehicle.constants.ts

export const VEHICLE_TYPES = [
  "sedan",
  "suv",
  "hatchback",
  "microbus",
  "minibus",
  "bus",
  "pickup",
  "van",
  "coaster",
  "other",
] as const;

export const FUEL_TYPES = ["petrol", "diesel", "cng", "electric", "hybrid"] as const;

export const TRANSMISSIONS = ["manual", "automatic"] as const;

// Wire format uses "on-trip" (hyphenated) — see vehicle.model.js's
// AVAILABILITY_TO_ENUM/FROM_ENUM mapping on the backend.
export const AVAILABILITY_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "available",
  "assigned",
  "on-trip",
  "maintenance",
  "inactive",
] as const;
