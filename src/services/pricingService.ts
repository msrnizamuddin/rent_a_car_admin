// src/services/pricingService.ts

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/http";
import { ENDPOINTS } from "@/constants/api.constants";

export type PricingRule = {
  id: string;
  name: string;
  tripType: "single" | "round" | "down" | null;
  categoryId: string | null;
  vehicleId: string | null;
  vehicleCondition: "new" | "old" | null;
  // Postgres Decimals arrive as numeric strings, same as every other
  // money-like field in this API — convert with Number(...) to use.
  basePrice: string | null;
  baseHours: string | null;
  includedKm: string | null;
  extraHourPrice: string | null;
  perKmRate: string | null;
  perHourRate: string | null;
  perDayRate: string | null;
  driverCharge: string | null;
  waitingCharge: string | null;
  // "Extra KM Price" — the per-km rate once includedKm is exceeded.
  extraKmCharge: string | null;
  nightCharge: string | null;
  serviceCharge: string | null;
  taxPercent: string | null;
  viewPriceLowOffset: string | null;
  viewPriceHighOffset: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PricingSearchParams = {
  tripType?: string;
  categoryId?: string;
  vehicleId?: string;
  vehicleCondition?: "new" | "old";
  isActive?: boolean;
};

export function searchPricing(params: PricingSearchParams, token?: string) {
  return apiGet<PricingRule[]>(ENDPOINTS.pricing.search, { params, token });
}

export function getAllPricing(token?: string) {
  return apiGet<PricingRule[]>(ENDPOINTS.pricing.all, { token });
}

export function getPricingById(id: string, token?: string) {
  return apiGet<PricingRule>(ENDPOINTS.pricing.byId(id), { token });
}

export type PricingPayload = {
  name: string;
  categoryId: string;
  vehicleCondition: "new" | "old";
  basePrice: number;
  baseHours: number;
  includedKm: number;
  extraKmCharge: number;
  extraHourPrice: number;
  isActive?: boolean;
  // Legacy/other pricing UIs — unused by the category+condition screen.
  tripType?: string;
  vehicleId?: string;
  perKmRate?: number;
  perHourRate?: number;
  perDayRate?: number;
  driverCharge?: number;
  waitingCharge?: number;
  nightCharge?: number;
  serviceCharge?: number;
  taxPercent?: number;
  viewPriceLowOffset?: number;
  viewPriceHighOffset?: number;
};

export function createPricing(payload: PricingPayload, token: string) {
  return apiPost<PricingRule>(ENDPOINTS.pricing.create, payload, { token });
}

export function updatePricing(id: string, payload: Partial<PricingPayload>, token: string) {
  return apiPatch<PricingRule>(ENDPOINTS.pricing.byId(id), payload, { token });
}

export function deletePricing(id: string, token: string) {
  return apiDelete(ENDPOINTS.pricing.byId(id), { token });
}
