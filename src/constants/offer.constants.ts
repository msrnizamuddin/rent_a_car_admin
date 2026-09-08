// src/constants/offer.constants.ts

// Reuses the backend's TripType enum (single/round/down).
export const OFFER_TRIP_TYPES = ["single", "round", "down"] as const;

export const OFFER_TRIP_TYPE_LABELS: Record<string, string> = {
  single: "One Way",
  round: "Round Trip",
  down: "Down Trip",
};

export const OFFER_STATUSES = ["active", "inactive"] as const;

export const DISCOUNT_TYPES = ["percentage", "fixed"] as const;
