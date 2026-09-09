// src/services/rentalRequestService.ts

import { apiGet, apiPatch } from "@/lib/http";
import { ENDPOINTS } from "@/constants/api.constants";

export type RentalRequestStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "estimate_provided"
  | "waiting_confirmation"
  | "confirmed"
  | "vehicle_assigned"
  | "driver_assigned"
  | "rejected"
  | "cancelled";

export type RentalRequest = {
  id: string;
  customerId: string;
  tripType: string;
  status: RentalRequestStatus;
  pickupLocation: { city?: string; address?: string } | null;
  destination: { city?: string; address?: string } | null;
  pickupDate: string;
  pickupTime: string;
  passengerCount: number;
  contactNumber: string;
  specialInstructions?: string | null;
  adminNotes?: string | null;
  callNotes?: string | null;
  estimatedRent?: { total?: number } | null;
  // The price the customer proposed when submitting the request.
  offeredPrice?: number | string | null;
  finalRent?: number | string | null;
  assignedVehicleId?: string | null;
  assignedDriverId?: string | null;
  vehicleId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RentalRequestListParams = {
  status?: RentalRequestStatus;
  page?: number;
  limit?: number;
};

export type RentalRequestListResponse = {
  rentalRequests: RentalRequest[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
};

export function listRentalRequests(params: RentalRequestListParams, token: string) {
  return apiGet<RentalRequestListResponse>(ENDPOINTS.rentalRequest.list, {
    params,
    token,
  });
}

export function getAllRentalRequests(token: string) {
  return apiGet<RentalRequest[]>(ENDPOINTS.rentalRequest.all, { token });
}

export function getRentalRequestById(id: string, token: string) {
  return apiGet<RentalRequest>(ENDPOINTS.rentalRequest.byId(id), { token });
}

export function reviewRentalRequest(
  id: string,
  payload: {
    adminNotes?: string;
    callNotes?: string;
    estimatedRent?: { total: number };
    finalRent?: number;
    status?: "under_review" | "estimate_provided";
  },
  token: string,
) {
  return apiPatch<RentalRequest>(ENDPOINTS.rentalRequest.review(id), payload, { token });
}

export function confirmRentalRequest(
  id: string,
  payload: { finalRent?: number },
  token: string,
) {
  return apiPatch<RentalRequest>(ENDPOINTS.rentalRequest.confirm(id), payload, { token });
}

export function rejectRentalRequest(id: string, reason: string, token: string) {
  return apiPatch<RentalRequest>(ENDPOINTS.rentalRequest.reject(id), { reason }, { token });
}

export function assignVehicle(id: string, vehicleId: string, token: string) {
  return apiPatch<RentalRequest>(
    ENDPOINTS.rentalRequest.assignVehicle(id),
    { vehicleId },
    { token },
  );
}

export function assignDriver(id: string, driverId: string, token: string) {
  return apiPatch<RentalRequest>(
    ENDPOINTS.rentalRequest.assignDriver(id),
    { driverId },
    { token },
  );
}
