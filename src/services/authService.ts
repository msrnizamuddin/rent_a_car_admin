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
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  address?: Record<string, unknown>;
  identification?: Record<string, unknown>;
  drivingLicense?: Record<string, unknown>;
  profilePicture?: string;
  // Only accepted by the backend when role is "manager" — the fixed set of
  // module access flags (see permissions.constants.ts).
  permissions?: Record<string, boolean>;
};

export function createStaff(payload: CreateStaffPayload, token: string) {
  return apiPost<StoredUser>(ENDPOINTS.auth.createStaff, payload, { token });
}

// Full profile edit for any user — superadmin/manager only. Every field is
// optional so callers can PATCH just the bits that changed.
export type UpdateUserPayload = {
  fullName?: string;
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  email?: string;
  mobileNumber?: string;
  address?: Record<string, unknown>;
  identification?: Record<string, unknown>;
  drivingLicense?: Record<string, unknown>;
  profilePicture?: string;
};

export function updateUser(id: string, payload: UpdateUserPayload, token: string) {
  return apiPatch<StoredUser>(ENDPOINTS.auth.userById(id), payload, { token });
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
  // Required by the backend when centralStatus is "inactive" — the cause
  // shown back to the driver on their next blocked login attempt.
  reason?: string;
};

export function updateAccountControl(
  id: string,
  payload: AccountControlPayload,
  token: string,
) {
  return apiPatch<StoredUser>(ENDPOINTS.auth.accountControl(id), payload, { token });
}
