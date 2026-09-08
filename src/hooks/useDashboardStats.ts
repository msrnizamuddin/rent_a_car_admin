"use client";

// src/hooks/useDashboardStats.ts

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getDashboardStats, type DashboardStats } from "@/services/dashboardService";

export function useDashboardStats() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    setLoading(true);
    getDashboardStats(token)
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err as Error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return { stats, loading, error };
}
