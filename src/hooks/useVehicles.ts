"use client";

// src/hooks/useVehicles.ts
//
// Admins need to see every vehicle regardless of status (pending, rejected,
// maintenance, etc.) — the customer-facing search endpoint deliberately
// hides anything that isn't publicly bookable (see vehicle.model.js's
// PUBLICLY_VISIBLE_STATUSES), which would make a freshly-added vehicle
// invisible in its own admin list. So this pulls the full "get everything"
// list and filters client-side instead.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAllVehicles, type Vehicle, type VehicleSearchParams } from "@/services/vehicleService";

export function useVehicles(filters: VehicleSearchParams = {}) {
  const { token } = useAuth();
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(() => {
    if (!token) return Promise.resolve();
    setLoading(true);
    return getAllVehicles(token)
      .then((data) => setAllVehicles(data || []))
      .catch((err) => {
        setError(err as Error);
        setAllVehicles([]);
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  const vehicles = useMemo(() => {
    const search = filters.search?.toLowerCase();
    return allVehicles.filter((v) => {
      if (filters.categoryId && v.categoryId !== filters.categoryId) return false;
      if (filters.vehicleType && v.vehicleType !== filters.vehicleType) return false;
      if (
        search &&
        !`${v.brand} ${v.vehicleName} ${v.registrationNumber}`.toLowerCase().includes(search)
      ) {
        return false;
      }
      return true;
    });
  }, [allVehicles, filters.categoryId, filters.vehicleType, filters.search]);

  const pagination: { total: number } | null = { total: vehicles.length };

  return { vehicles, pagination, loading, error, reload };
}
