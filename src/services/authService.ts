// src/services/authService.ts
//
// Plain async functions that call the auth API. No React here — hooks/
// context wrap these with state.

import { apiGet, apiPatch, apiPost } from "@/lib/http";
import { ENDPOINTS } from "@/constants/api.constants";
import type { StoredUser } from "@/lib/authStorage";

export type LoginResponse = { token: string; user: StoredUser };

export function login(emailOrPhone: string, password: string) {
  return apiPost<LoginResponse>(ENDPOINTS.auth.login, { emailOrPhone, password });
}

export function logout(token: string) {
  return apiPost(ENDPOINTS.auth.logout, undefined, { token });
}

export function getProfile(token: string) {
  return apiGet<StoredUser>(ENDPOINTS.auth.profile, { token });
}

export function updateProfile(payload: Record<string, unknown>, token: string) {
  return apiPatch<StoredUser>(ENDPOINTS.auth.updateProfile, payload, { token });
}

export function changePassword(
  payload: { oldPassword: string; newPassword: string; confirmPassword: string },
  token: string,
) {
  return apiPatch(ENDPOINTS.auth.changePassword, payload, { token });
}

// role: "superadmin" | "manager" | "driver" — creates a staff/driver account.
export type CreateStaffPayload = {
  role: "superadmin" | "manager" | "driver";
  fullName: string;
  mobileNumber: string;
  email?: string;
  password: string;
  address?: Record<string, unknown>;
  identification?: Record<string, unknown>;
  drivingLicense?: Record<string, unknown>;
};

export function createStaff(payload: CreateStaffPayload, token: string) {
  return apiPost<StoredUser>(ENDPOINTS.auth.createStaff, payload, { token });
}

export type UserListParams = {
  role?: "superadmin" | "manager" | "driver" | "customer";
  search?: string;
  page?: number;
  limit?: number;
};

export type UserListResponse = {
  users: StoredUser[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
};

export function listUsers(params: UserListParams, token: string) {
  return apiGet<UserListResponse>(ENDPOINTS.auth.users, { params, token });
}

export function getUserById(id: string, token: string) {
  return apiGet<StoredUser>(ENDPOINTS.auth.userById(id), { token });
}

export type AccountControlPayload = {
  role?: "superadmin" | "manager" | "driver" | "customer";
  centralStatus?: "active" | "inactive" | "suspended" | "blocked";
  driverStatus?:
    | "pending"
    | "approved"
    | "available"
    | "assigned"
    | "on-trip"
    | "offline";
  permissions?: Record<string, unknown>;
};

export function updateAccountControl(
  id: string,
  payload: AccountControlPayload,
  token: string,
) {
  return apiPatch<StoredUser>(ENDPOINTS.auth.accountControl(id), payload, { token });
}
