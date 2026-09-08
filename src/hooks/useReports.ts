"use client";

// src/hooks/useReports.ts

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getUserReport,
  getVehicleReport,
  getDriverReport,
  getTripReport,
  getFinancialReport,
  type UserReport,
  type VehicleReport,
  type DriverReport,
  type TripReport,
  type FinancialReport,
} from "@/services/reportService";

export type Reports = {
  users: UserReport;
  vehicles: VehicleReport;
  drivers: DriverReport;
  trips: TripReport;
  financial: FinancialReport;
};

export function useReports() {
  const { token } = useAuth();
  const [reports, setReports] = useState<Reports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    setLoading(true);
    Promise.all([
      getUserReport(token),
      getVehicleReport(token),
      getDriverReport(token),
      getTripReport(token),
      getFinancialReport(token),
    ])
      .then(([users, vehicles, drivers, trips, financial]) => {
        if (!cancelled) setReports({ users, vehicles, drivers, trips, financial });
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

  return { reports, loading, error };
}
