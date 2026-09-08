"use client";

// src/components/drivers/DriverStatusControl.tsx
//
// Self-contained driver/account status editor for the Driver edit page —
// same pattern as DriverOwnVehicle: fetches its own data, saves
// immediately on change via PATCH /auth/web/account/:userId.

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserById, updateAccountControl } from "@/services/authService";
import { formatApiError } from "@/lib/errorMessages";
import StatusBadgeSelect from "@/components/shared/StatusBadgeSelect";
import { DRIVER_STATUSES, CENTRAL_STATUSES } from "@/constants/user.constants";

export const driverStatusStyle: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600",
  approved: "bg-green-50 text-green-600",
  available: "bg-green-50 text-green-600",
  assigned: "bg-blue-50 text-blue-600",
  "on-trip": "bg-blue-50 text-blue-600",
  offline: "bg-slate-100 text-slate-500",
};

export const centralStatusStyle: Record<string, string> = {
  active: "bg-green-50 text-green-600",
  inactive: "bg-slate-100 text-slate-500",
  suspended: "bg-amber-50 text-amber-600",
  blocked: "bg-red-50 text-red-600",
};

type Props = { driverId: string };

export default function DriverStatusControl({ driverId }: Props) {
  const { token } = useAuth();
  const [driverStatus, setDriverStatus] = useState("");
  const [centralStatus, setCentralStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState<"driverStatus" | "centralStatus" | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    getUserById(driverId, token)
      .then((user) => {
        setDriverStatus((user.driverStatus as string) || "pending");
        setCentralStatus((user.centralStatus as string) || "active");
      })
      .catch((err) => setError(formatApiError(err, "Could not load status.")))
      .finally(() => setLoading(false));
  }, [driverId, token]);

  const handleChange = async (field: "driverStatus" | "centralStatus", value: string) => {
    if (!token) return;

    setError("");
    setSavingField(field);

    try {
      await updateAccountControl(driverId, { [field]: value }, token);
      if (field === "driverStatus") setDriverStatus(value);
      else setCentralStatus(value);
    } catch (err) {
      setError(formatApiError(err, "Could not update status."));
    } finally {
      setSavingField(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-400">Loading status…</p>;
  }

  return (
    <div className="border border-slate-100 rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-slate-800 mb-1">Status</h2>
      <p className="text-xs text-slate-500 mb-4">
        Driver status affects trip eligibility; account status controls whether they can log
        in at all.
      </p>
      <div className="flex flex-wrap items-center gap-6">
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1.5 block">Driver status</label>
          <StatusBadgeSelect
            value={driverStatus}
            options={DRIVER_STATUSES}
            styleMap={driverStatusStyle}
            disabled={savingField === "driverStatus"}
            onChange={(v) => handleChange("driverStatus", v)}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1.5 block">Account status</label>
          <StatusBadgeSelect
            value={centralStatus}
            options={CENTRAL_STATUSES}
            styleMap={centralStatusStyle}
            disabled={savingField === "centralStatus"}
            onChange={(v) => handleChange("centralStatus", v)}
          />
        </div>
      </div>
      {error && <p className="text-sm font-medium text-red-500 mt-3">{error}</p>}
    </div>
  );
}
