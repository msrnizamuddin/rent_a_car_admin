"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRentalRequest } from "@/hooks/useRentalRequest";
import { useVehicles } from "@/hooks/useVehicles";
import { useUsers } from "@/hooks/useUsers";
import { formatApiError } from "@/lib/errorMessages";
import {
  reviewRentalRequest,
  confirmRentalRequest,
  rejectRentalRequest,
  assignVehicle,
  assignDriver,
} from "@/services/rentalRequestService";

const inputClass =
  "w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition";

function ActionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 p-5">
      <h3 className="text-sm font-semibold text-black mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function BookingDetail({ id }: { id: string }) {
  const { token } = useAuth();
  const { rentalRequest, loading, error, reload } = useRentalRequest(id);
  const { vehicles } = useVehicles({ limit: 100 });
  const { users: drivers } = useUsers({ role: "driver", limit: 100 });

  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);

  const [adminNotes, setAdminNotes] = useState("");
  const [estimatedTotal, setEstimatedTotal] = useState("");
  const [finalRent, setFinalRent] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");

  if (loading) return <p className="text-sm text-black">Loading booking…</p>;
  if (error || !rentalRequest)
    return <p className="text-sm text-red-500">Couldn&apos;t load this booking.</p>;

  const run = async (action: () => Promise<unknown>) => {
    if (!token) return;
    setActionError("");
    setBusy(true);
    try {
      await action();
      await reload();
    } catch (err) {
      setActionError(formatApiError(err, "Action failed, please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Link
        href="/dashboard/bookings"
        className="inline-flex items-center gap-1.5 text-sm text-black hover:text-black mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to bookings
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-black">
            Booking {rentalRequest.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-black capitalize">
            {rentalRequest.status.replace(/_/g, " ")} · {rentalRequest.tripType} trip
          </p>
        </div>
      </div>

      {actionError && (
        <p className="mb-4 text-sm font-medium text-red-500">{actionError}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-black mb-3">Trip details</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-black">Pickup</dt>
              <dd className="text-black">
                {rentalRequest.pickupLocation?.city || "—"} · {rentalRequest.pickupDate}{" "}
                {rentalRequest.pickupTime}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-black">Destination</dt>
              <dd className="text-black">{rentalRequest.destination?.city || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-black">Passengers</dt>
              <dd className="text-black">{rentalRequest.passengerCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-black">Contact</dt>
              <dd className="text-black">{rentalRequest.contactNumber}</dd>
            </div>
            {rentalRequest.specialInstructions && (
              <div className="flex justify-between gap-4">
                <dt className="text-black shrink-0">Notes</dt>
                <dd className="text-black text-right">
                  {rentalRequest.specialInstructions}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-black mb-3">Fare & assignment</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-black">Estimated rent</dt>
              <dd className="text-black">
                {rentalRequest.estimatedRent?.total
                  ? `৳${rentalRequest.estimatedRent.total}`
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-black">Final rent</dt>
              <dd className="text-black">
                {rentalRequest.finalRent ? `৳${rentalRequest.finalRent}` : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-black">Assigned vehicle</dt>
              <dd className="text-black">
                {rentalRequest.assignedVehicleId?.slice(0, 8) || "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-black">Assigned driver</dt>
              <dd className="text-black">
                {rentalRequest.assignedDriverId?.slice(0, 8) || "—"}
              </dd>
            </div>
            {rentalRequest.adminNotes && (
              <div className="flex justify-between gap-4">
                <dt className="text-black shrink-0">Admin notes</dt>
                <dd className="text-black text-right">{rentalRequest.adminNotes}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Review */}
        <ActionCard title="Review & estimate">
          <div className="space-y-3">
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Admin notes (optional)"
              rows={2}
              className={`${inputClass} h-auto py-2.5 resize-none`}
            />
            <input
              type="number"
              value={estimatedTotal}
              onChange={(e) => setEstimatedTotal(e.target.value)}
              placeholder="Estimated total (৳)"
              className={inputClass}
            />
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                run(() =>
                  reviewRentalRequest(
                    id,
                    {
                      adminNotes: adminNotes || undefined,
                      estimatedRent: estimatedTotal
                        ? { total: Number(estimatedTotal) }
                        : undefined,
                      status: "estimate_provided",
                    },
                    token!,
                  ),
                )
              }
              className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white text-sm font-semibold transition"
            >
              Submit review
            </button>
          </div>
        </ActionCard>

        {/* Confirm */}
        <ActionCard title="Confirm booking">
          <div className="space-y-3">
            <input
              type="number"
              value={finalRent}
              onChange={(e) => setFinalRent(e.target.value)}
              placeholder="Final rent (৳, optional)"
              className={inputClass}
            />
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                run(() =>
                  confirmRentalRequest(
                    id,
                    { finalRent: finalRent ? Number(finalRent) : undefined },
                    token!,
                  ),
                )
              }
              className="h-10 px-4 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold transition"
            >
              Confirm booking
            </button>
          </div>
        </ActionCard>

        {/* Assign vehicle */}
        <ActionCard title="Assign vehicle">
          <div className="space-y-3">
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.vehicleName} — {v.registrationNumber}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={busy || !vehicleId}
              onClick={() => run(() => assignVehicle(id, vehicleId, token!))}
              className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition"
            >
              Assign vehicle
            </button>
          </div>
        </ActionCard>

        {/* Assign driver */}
        <ActionCard title="Assign driver">
          <div className="space-y-3">
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a driver</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName as string} — {d.mobileNumber as string}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={busy || !driverId}
              onClick={() => run(() => assignDriver(id, driverId, token!))}
              className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition"
            >
              Assign driver
            </button>
          </div>
        </ActionCard>

        {/* Reject */}
        <ActionCard title="Reject booking">
          <div className="space-y-3">
            <input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection"
              className={inputClass}
            />
            <button
              type="button"
              disabled={busy || !rejectReason.trim()}
              onClick={() => run(() => rejectRentalRequest(id, rejectReason, token!))}
              className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold transition"
            >
              Reject booking
            </button>
          </div>
        </ActionCard>
      </div>
    </div>
  );
}
