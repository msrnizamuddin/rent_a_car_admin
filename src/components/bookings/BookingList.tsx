"use client";

import { useState } from "react";
import Link from "next/link";
import { useRentalRequests } from "@/hooks/useRentalRequests";
import type { RentalRequestStatus } from "@/services/rentalRequestService";

const STATUS_OPTIONS: { value: RentalRequestStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "estimate_provided", label: "Estimate provided" },
  { value: "waiting_confirmation", label: "Waiting confirmation" },
  { value: "confirmed", label: "Confirmed" },
  { value: "vehicle_assigned", label: "Vehicle assigned" },
  { value: "driver_assigned", label: "Driver assigned" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

export const statusStyle: Record<string, string> = {
  submitted: "bg-blue-50 text-blue-600",
  under_review: "bg-amber-50 text-amber-600",
  estimate_provided: "bg-amber-50 text-amber-600",
  waiting_confirmation: "bg-amber-50 text-amber-600",
  confirmed: "bg-green-50 text-green-600",
  vehicle_assigned: "bg-green-50 text-green-600",
  driver_assigned: "bg-green-50 text-green-600",
  rejected: "bg-red-50 text-red-600",
  cancelled: "bg-slate-100 text-black",
};

export default function BookingList() {
  const [status, setStatus] = useState<RentalRequestStatus | "">("");
  const { rentalRequests, pagination, loading, error } = useRentalRequests({
    status: status || undefined,
    limit: 50,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-black">Bookings</h1>
          <p className="text-sm text-black">
            {pagination?.total ?? rentalRequests.length} rental requests
          </p>
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as RentalRequestStatus | "")}
          className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-black outline-none focus:border-blue-500"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-black">Loading bookings…</p>
      ) : error ? (
        <p className="text-sm text-red-500">Couldn&apos;t load bookings.</p>
      ) : rentalRequests.length === 0 ? (
        <p className="text-sm text-black">No rental requests found.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-black">
                <th className="py-3 px-4">Request</th>
                <th className="py-3 px-4">Trip type</th>
                <th className="py-3 px-4">Pickup</th>
                <th className="py-3 px-4">Offered price</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rentalRequests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <Link
                      href={`/dashboard/bookings/${r.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {r.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="py-3 px-4 capitalize text-black">{r.tripType}</td>
                  <td className="py-3 px-4 text-black">
                    {r.pickupLocation?.city || "—"} · {r.pickupDate}
                  </td>
                  <td className="py-3 px-4 text-black">
                    {r.offeredPrice ? `৳${Number(r.offeredPrice).toLocaleString()}` : "—"}
                  </td>
                  <td className="py-3 px-4 text-black">{r.contactNumber}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        statusStyle[r.status] || "bg-slate-100 text-black"
                      }`}
                    >
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-black">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
