"use client";

// src/components/vehicles/DriverAssignment.tsx
//
// Persistent fleet-level "this driver drives this car" pairing — separate
// from any specific trip/rental. Lives on the vehicle edit page.

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import { assignDriverToVehicle, getVehicleById } from "@/services/vehicleService";
import { formatApiError } from "@/lib/errorMessages";

type Props = { vehicleId: string };

export default function DriverAssignment({ vehicleId }: Props) {
  const { token } = useAuth();
  const { users: drivers, loading: driversLoading } = useUsers({ role: "driver", limit: 200 });

  const [assignedDriverId, setAssignedDriverId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    getVehicleById(vehicleId, token)
      .then((vehicle) => setAssignedDriverId(vehicle.assignedDriverId))
      .catch((err) => setError(formatApiError(err, "Could not load assignment.")))
      .finally(() => setLoading(false));
  }, [vehicleId, token]);

  const assignedDriver = drivers.find((d) => d.id === assignedDriverId);

  const handleAssign = async (driverId: string) => {
    if (!token) return;

    setSaving(true);
    setError("");

    try {
      await assignDriverToVehicle(vehicleId, driverId || null, token);
      setAssignedDriverId(driverId || null);
    } catch (err) {
      setError(formatApiError(err, "Could not update driver assignment."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl border border-slate-100 rounded-2xl p-5 mt-6">
      <h2 className="text-sm font-semibold text-black mb-1">Driver assignment</h2>
      <p className="text-xs text-black mb-4">
        Pair this vehicle with a driver on the fleet — a standing assignment, separate from any
        specific trip.
      </p>

      {loading || driversLoading ? (
        <p className="text-sm text-black">Loading…</p>
      ) : (
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={assignedDriverId || ""}
            onChange={(e) => handleAssign(e.target.value)}
            disabled={saving}
            className="h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-black outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition disabled:opacity-60"
          >
            <option value="">Unassigned</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.fullName as string}
              </option>
            ))}
          </select>

          {assignedDriver && (
            <button
              type="button"
              onClick={() => handleAssign("")}
              disabled={saving}
              className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium text-black hover:bg-slate-50 disabled:opacity-60 transition"
            >
              Unassign
            </button>
          )}

          {assignedDriver && (
            <span className="text-sm text-black">
              Currently assigned:{" "}
              <span className="font-medium text-black">
                {assignedDriver.fullName as string}
              </span>
            </span>
          )}
        </div>
      )}

      {error && <p className="text-sm font-medium text-red-500 mt-3">{error}</p>}
    </div>
  );
}
