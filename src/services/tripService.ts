// src/services/tripService.ts

import { apiGet, apiPatch } from "@/lib/http";
import { ENDPOINTS } from "@/constants/api.constants";

export type Trip = {
  id: string;
  rentalRequestId: string;
  customerId: string;
  driverId?: string | null;
  vehicleId?: string | null;
  status: string;
  pickupDate: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
};

export type TripListParams = {
  status?: string;
  page?: number;
  limit?: number;
};

export type TripListResponse = {
  trips: Trip[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
};

export function listTrips(params: TripListParams, token: string) {
  return apiGet<TripListResponse>(ENDPOINTS.trip.list, { params, token });
}

export function getAllTrips(token: string) {
  return apiGet<Trip[]>(ENDPOINTS.trip.all, { token });
}

export function getTripById(id: string, token: string) {
  return apiGet<Trip>(ENDPOINTS.trip.byId(id), { token });
}

export function cancelTrip(id: string, cancellationReason: string, token: string) {
  return apiPatch<Trip>(ENDPOINTS.trip.cancel(id), { cancellationReason }, { token });
}
