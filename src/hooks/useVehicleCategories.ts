"use client";

// src/hooks/useVehicleCategories.ts

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  listVehicleCategories,
  type VehicleCategory,
} from "@/services/vehicleCategoryService";

export function useVehicleCategories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    return listVehicleCategories(token || undefined)
      .then((data) => setCategories(data || []))
      .catch((err) => setError(err as Error))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { categories, loading, error, reload };
}
