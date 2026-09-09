// src/services/driverApplicationService.ts

import { apiGet, apiPatch } from "@/lib/http";
import { ENDPOINTS } from "@/constants/api.constants";

export type DriverApplicationStatus = "pending" | "approved" | "rejected";

export type DriverApplication = {
  id: string;
  fullName: string;
  mobileNumber: string;
  email: string | null;
  licenseNumber: string;
  status: DriverApplicationStatus;
  rejectionReason: string | null;
  reviewedById: string | null;
  createdAt: string;
  updatedAt: string;
};

export function getAllDriverApplications(token: string) {
  return apiGet<DriverApplication[]>(ENDPOINTS.driverApplication.all, { token });
}

export function approveDriverApplication(id: string, token: string) {
  return apiPatch<DriverApplication>(ENDPOINTS.driverApplication.approve(id), {}, { token });
}

export function rejectDriverApplication(id: string, rejectionReason: string, token: string) {
  return apiPatch<DriverApplication>(
    ENDPOINTS.driverApplication.reject(id),
    { rejectionReason },
    { token },
  );
}
