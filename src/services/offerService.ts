// src/services/offerService.ts

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/http";
import { ENDPOINTS } from "@/constants/api.constants";

export type Offer = {
  id: string;
  title: string;
  subtitle: string | null;
  tripType: string | null;
  status: "active" | "inactive";
  fromLocation: string | null;
  toLocation: string | null;
  discountType: "percentage" | "fixed";
  // A Postgres Decimal — arrives as a numeric string, same as
  // Payment/Invoice amount fields. Convert with Number(...) to use in a
  // number input.
  discountValue: string;
  startDate: string | null;
  endDate: string | null;
  bannerImage: string | null;
  offerText: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OfferSearchParams = {
  status?: "active" | "inactive";
  tripType?: string;
};

export function searchOffers(params: OfferSearchParams, token?: string) {
  return apiGet<Offer[]>(ENDPOINTS.offer.list, { params, token });
}

export function getAllOffers(token?: string) {
  return apiGet<Offer[]>(ENDPOINTS.offer.all, { token });
}

export function getOfferById(id: string, token?: string) {
  return apiGet<Offer>(ENDPOINTS.offer.byId(id), { token });
}

export type OfferPayload = {
  title: string;
  subtitle?: string;
  tripType?: string;
  status?: "active" | "inactive";
  fromLocation?: string;
  toLocation?: string;
  discountType?: "percentage" | "fixed";
  discountValue: number;
  startDate?: string;
  endDate?: string;
  bannerImage?: string;
  offerText?: string;
};

export function createOffer(payload: OfferPayload, token: string) {
  return apiPost<Offer>(ENDPOINTS.offer.list, payload, { token });
}

export function updateOffer(
  id: string,
  payload: Partial<OfferPayload>,
  token: string,
) {
  return apiPatch<Offer>(ENDPOINTS.offer.byId(id), payload, { token });
}

export function deleteOffer(id: string, token: string) {
  return apiDelete(ENDPOINTS.offer.byId(id), { token });
}
