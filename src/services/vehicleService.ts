// src/services/vehicleService.ts

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/http";
import { ENDPOINTS } from "@/constants/api.constants";

export type VehicleLocation = {
  city: string;
  district?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
};

export type Vehicle = {
  id: string;
  vehicleName: string;
  brand: string;
  vehicleModel: string;
  categoryId: string | null;
  vehicleType: string;
  images: string[];
  registrationNumber: string;
  modelYear: number;
  seatingCapacity: number;
  fuelType: string;
  transmission: string;
  isAC: boolean;
  features: string[];
  color: string | null;
  location: VehicleLocation | null;
  estimatedRentalRate: { perKm?: number; perDay?: number; perHour?: number } | null;
  availabilityStatus: string;
  driverRequired: boolean;
  ownerInfo: { name?: string; contactNumber?: string } | null;
  assignedDriverId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VehicleSearchParams = {
  search?: string;
  brand?: string;
  categoryId?: string;
  location?: string;
  vehicleType?: string;
  availability?: string;
  page?: number;
  limit?: number;
};

export type VehicleListResponse = {
  vehicles: Vehicle[];
  pagination?: { total: number; page: number; limit: number; totalPages: number };
  total?: number;
};

export function searchVehicles(params: VehicleSearchParams, token: string) {
  return apiGet<VehicleListResponse>(ENDPOINTS.vehicle.search, { params, token });
}

export function getAllVehicles(token: string) {
  return apiGet<Vehicle[]>(ENDPOINTS.vehicle.all, { token });
}

export function getVehicleById(id: string, token: string) {
  return apiGet<Vehicle>(ENDPOINTS.vehicle.byId(id), { token });
}

export type CreateVehiclePayload = {
  vehicleName: string;
  brand: string;
  vehicleModel: string;
  categoryId: string;
  vehicleType: string;
  images?: string[];
  registrationNumber: string;
  modelYear: number;
  seatingCapacity: number;
  fuelType: string;
  transmission: string;
  isAC?: boolean;
  features?: string[];
  color?: string;
  location?: VehicleLocation;
  estimatedRentalRate?: { perKm?: number; perDay?: number; perHour?: number };
  availabilityStatus?: string;
  driverRequired?: boolean;
  ownerInfo?: { name?: string; contactNumber?: string };
};

export function createVehicle(payload: CreateVehiclePayload, token: string) {
  return apiPost<Vehicle>(ENDPOINTS.vehicle.search, payload, { token });
}

// assignedDriverId is a persistent fleet-level "this driver drives this
// car" pairing, separate from CreateVehiclePayload — pass null to unassign.
export type UpdateVehiclePayload = Partial<CreateVehiclePayload> & {
  assignedDriverId?: string | null;
};

export function updateVehicle(id: string, payload: UpdateVehiclePayload, token: string) {
  return apiPatch<Vehicle>(ENDPOINTS.vehicle.byId(id), payload, { token });
}

export function deleteVehicle(id: string, token: string) {
  return apiDelete(ENDPOINTS.vehicle.byId(id), { token });
}

// Pass driverId: null to unassign.
export function assignDriverToVehicle(id: string, driverId: string | null, token: string) {
  return updateVehicle(id, { assignedDriverId: driverId }, token);
}
