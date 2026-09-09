// src/services/touristSpotService.ts

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/http";
import { ENDPOINTS } from "@/constants/api.constants";

export type TouristSpot = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  location: string | null;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};

export type TouristSpotSearchParams = {
  status?: "active" | "inactive";
};

export function searchTouristSpots(params: TouristSpotSearchParams, token?: string) {
  return apiGet<TouristSpot[]>(ENDPOINTS.touristSpot.list, { params, token });
}

export function getAllTouristSpots(token?: string) {
  return apiGet<TouristSpot[]>(ENDPOINTS.touristSpot.all, { token });
}

export function getTouristSpotById(id: string, token?: string) {
  return apiGet<TouristSpot>(ENDPOINTS.touristSpot.byId(id), { token });
}

export type TouristSpotPayload = {
  name: string;
  description?: string;
  image?: string;
  location?: string;
  status?: "active" | "inactive";
};

export function createTouristSpot(payload: TouristSpotPayload, token: string) {
  return apiPost<TouristSpot>(ENDPOINTS.touristSpot.list, payload, { token });
}

export function updateTouristSpot(
  id: string,
  payload: Partial<TouristSpotPayload>,
  token: string,
) {
  return apiPatch<TouristSpot>(ENDPOINTS.touristSpot.byId(id), payload, { token });
}

export function deleteTouristSpot(id: string, token: string) {
  return apiDelete(ENDPOINTS.touristSpot.byId(id), { token });
}
