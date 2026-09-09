// src/constants/pricing.constants.ts

export const PRICING_TRIP_TYPES = ["single", "round", "down"] as const;

// "down" trip type is the same enum value the Offer module labels "Down
// Trip" — this screen calls it "Program Trip" to match how it's referred
// to for pricing configuration.
export const PRICING_TRIP_TYPE_LABELS: Record<string, string> = {
  single: "One Way",
  round: "Round Trip",
  down: "Program Trip",
};
