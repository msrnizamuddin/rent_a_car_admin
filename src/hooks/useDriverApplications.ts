"use client";

// src/hooks/useDriverApplications.ts

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAllDriverApplications, type DriverApplication } from "@/services/driverApplicationService";

export function useDriverApplications() {
  const { token } = useAuth();
  const [applications, setApplications] = useState<DriverApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(() => {
    if (!token) return Promise.resolve();

    setLoading(true);
    return getAllDriverApplications(token)
      .then((data) => setApplications(data || []))
      .catch((err) => setError(err as Error))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { applications, loading, error, reload };
}
