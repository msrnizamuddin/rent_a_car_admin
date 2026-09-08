// src/services/vehicleCategoryService.ts

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/http";
import { ENDPOINTS } from "@/constants/api.constants";

export type VehicleCategory = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};

export function listVehicleCategories(token?: string) {
  return apiGet<VehicleCategory[]>(ENDPOINTS.vehicleCategory.all, { token });
}

export function createVehicleCategory(
  payload: { name: string; description?: string; image?: string },
  token: string,
) {
  return apiPost<VehicleCategory>(ENDPOINTS.vehicleCategory.list, payload, { token });
}

export function updateVehicleCategory(
  id: string,
  payload: Partial<{ name: string; description: string; image: string; status: string }>,
  token: string,
) {
  return apiPatch<VehicleCategory>(ENDPOINTS.vehicleCategory.byId(id), payload, { token });
}

export function deleteVehicleCategory(id: string, token: string) {
  return apiDelete(ENDPOINTS.vehicleCategory.byId(id), { token });
}
