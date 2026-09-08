// src/lib/authStorage.ts
//
// Small localStorage wrapper for the JWT + logged-in admin/manager user.

export type StoredUser = {
  id: string;
  role: "superadmin" | "manager" | "driver" | "customer";
  fullName: string;
  mobileNumber?: string;
  email?: string | null;
  [key: string]: unknown;
};

const TOKEN_KEY = "racadmin_token";
const USER_KEY = "racadmin_user";

export function loadToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function loadUser(): StoredUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: StoredUser) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Storage can fail in private-browsing mode — session just won't persist.
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}
