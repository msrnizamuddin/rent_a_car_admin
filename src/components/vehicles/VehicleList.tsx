"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Pencil } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useVehicles } from "@/hooks/useVehicles";
import { useVehicleCategories } from "@/hooks/useVehicleCategories";
import { updateVehicle } from "@/services/vehicleService";
import { formatApiError } from "@/lib/errorMessages";
import StatusBadgeSelect from "@/components/shared/StatusBadgeSelect";

const STATUS_OPTIONS = [
  "pending",
  "approved",
  "rejected",
  "available",
  "assigned",
  "on-trip",
  "maintenance",
  "inactive",
];

const statusStyle: Record<string, string> = {
  available: "bg-green-50 text-green-600",
  assigned: "bg-blue-50 text-blue-600",
  "on-trip": "bg-blue-50 text-blue-600",
  pending: "bg-amber-50 text-amber-600",
  approved: "bg-green-50 text-green-600",
  rejected: "bg-red-50 text-red-600",
  maintenance: "bg-amber-50 text-amber-600",
  inactive: "bg-slate-100 text-black",
};

export default function VehicleList() {
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const [categoryId, setCategoryId] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const { categories } = useVehicleCategories();
  const { vehicles, pagination, loading, error, reload } = useVehicles({
    search: search || undefined,
    categoryId: categoryId || undefined,
    limit: 50,
  });

  const handleStatusChange = async (id: string, status: string) => {
    if (!token) return;
    setActionError("");
    setBusyId(id);
    try {
      await updateVehicle(id, { availabilityStatus: status }, token);
      await reload();
    } catch (err) {
      setActionError(formatApiError(err, "Could not update status."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-black">Vehicles</h1>
          <p className="text-sm text-black">
            {pagination?.total ?? vehicles.length} total vehicles
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[160px] sm:flex-none sm:w-56">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vehicles"
              className="h-11 w-full pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-black placeholder:text-black outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
            />
          </div>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-black outline-none focus:border-blue-500 shrink-0"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <Link
            href="/dashboard/vehicles/new"
            className="h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add vehicle
          </Link>
        </div>
      </div>

      {actionError && <p className="mb-4 text-sm font-medium text-red-500">{actionError}</p>}

      {loading ? (
        <p className="text-sm text-black">Loading vehicles…</p>
      ) : error ? (
        <p className="text-sm text-red-500">Couldn&apos;t load vehicles.</p>
      ) : vehicles.length === 0 ? (
        <p className="text-sm text-black">No vehicles found.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-black">
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Registration</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Rate / day</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {v.images?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={v.images[0]}
                          alt={v.vehicleName}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <div>
                        <p className="font-medium text-black">
                          {v.brand} {v.vehicleName}
                        </p>
                        <p className="text-xs text-black">{v.vehicleModel}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-black">{v.registrationNumber}</td>
                  <td className="py-3 px-4 capitalize text-black">{v.vehicleType}</td>
                  <td className="py-3 px-4 text-black">{v.location?.city || "—"}</td>
                  <td className="py-3 px-4 text-black">
                    {v.estimatedRentalRate?.perDay
                      ? `৳${v.estimatedRentalRate.perDay}`
                      : "—"}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadgeSelect
                      value={v.availabilityStatus}
                      options={STATUS_OPTIONS}
                      styleMap={statusStyle}
                      disabled={busyId === v.id}
                      onChange={(status) => handleStatusChange(v.id, status)}
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/dashboard/vehicles/${v.id}/edit`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </Link>
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
