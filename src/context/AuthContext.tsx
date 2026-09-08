"use client";

// src/context/AuthContext.tsx
//
// Session state for the admin panel — same pattern as the customer site's
// AuthContext (see rent_a_car/src/context/AuthContext.jsx): a provider that
// persists to localStorage, plus a useAuth() hook. This panel is
// superadmin/manager only — login() rejects any other role client-side
// (the backend's authorize() middleware would reject every /web call from
// such an account anyway, so failing fast here just gives a clear message
// instead of a confusing wall of 403s).

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as authService from "@/services/authService";
import { clearSession, loadToken, loadUser, saveSession, type StoredUser } from "@/lib/authStorage";
import { ApiError } from "@/lib/http";

type AuthContextValue = {
  token: string | null;
  user: StoredUser | null;
  isAuthenticated: boolean;
  isReady: boolean;
  role: StoredUser["role"] | null;
  login: (emailOrPhone: string, password: string) => Promise<{ user: StoredUser; token: string }>;
  logout: () => void;
  refreshProfile: () => Promise<StoredUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const ADMIN_ROLES: StoredUser["role"][] = ["superadmin", "manager"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setToken(loadToken());
    setUser(loadUser());
    setMounted(true);
  }, []);

  const applySession = (nextToken: string, nextUser: StoredUser) => {
    setToken(nextToken);
    setUser(nextUser);
    saveSession(nextToken, nextUser);
  };

  const login = async (emailOrPhone: string, password: string) => {
    const data = await authService.login(emailOrPhone, password);

    if (!ADMIN_ROLES.includes(data.user.role)) {
      throw new ApiError(
        "This panel is for admins and managers only. Use the customer or driver app instead.",
        403,
      );
    }

    applySession(data.token, data.user);
    return { user: data.user, token: data.token };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    clearSession();
  };

  const refreshProfile = async () => {
    if (!token) return null;

    const freshUser = await authService.getProfile(token);
    setUser(freshUser);
    saveSession(token, freshUser);
    return freshUser;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token && user),
        isReady: mounted,
        role: user?.role || null,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
