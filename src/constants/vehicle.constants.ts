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

// Sorted A-Z for display in a single-select dropdown — fuelType is a
// single enum value on the backend, not an array.
export const FUEL_TYPES = ["cng", "diesel", "electric", "hybrid", "petrol"] as const;

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
