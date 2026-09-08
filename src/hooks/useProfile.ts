"use client";

// src/hooks/useProfile.ts

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateProfile as updateProfileService, changePassword as changePasswordService } from "@/services/authService";
import type { StoredUser } from "@/lib/authStorage";

export function useProfile() {
  const { token, user, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateProfile = async (payload: Partial<StoredUser>) => {
    if (!token) return;
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await updateProfileService(payload, token);
      await refreshProfile();
      setSuccess("Profile updated.");
    } catch (err) {
      setError((err as Error).message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!token) return;
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await changePasswordService({ oldPassword, newPassword, confirmPassword: newPassword }, token);
      setSuccess("Password changed.");
    } catch (err) {
      setError((err as Error).message || "Could not change password.");
    } finally {
      setSaving(false);
    }
  };

  return { user, saving, error, success, updateProfile, changePassword };
}
