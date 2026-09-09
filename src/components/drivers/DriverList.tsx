"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Plus, Pencil, Eye } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import { updateAccountControl } from "@/services/authService";
import { formatApiError } from "@/lib/errorMessages";
import StatusBadgeSelect from "@/components/shared/StatusBadgeSelect";
import { driverStatusStyle, centralStatusStyle } from "@/components/drivers/DriverStatusControl";
import { DRIVER_STATUSES, CENTRAL_STATUSES } from "@/constants/user.constants";

export default function DriverList() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const { users, pagination, loading, error, reload } = useUsers({
    role: "driver",
    search: search || undefined,
    limit: 50,
  });

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const handleStatusChange = async (
    driverId: string,
    field: "driverStatus" | "centralStatus",
    value: string,
  ) => {
    if (!token) return;

    // The backend requires a written cause whenever centralStatus is set to
    // "inactive" — it's shown back to the driver on their next blocked
    // login attempt.
    let reason: string | undefined;
    if (field === "centralStatus" && value === "inactive") {
      const entered = window.prompt("Why is this driver being deactivated?");
      if (!entered || !entered.trim()) return;
      reason = entered.trim();
    }

    setActionError("");
    setUpdatingId(driverId);

    try {
      await updateAccountControl(driverId, { [field]: value, ...(reason ? { reason } : {}) }, token);
      await reload();
    } catch (err) {
      setActionError(formatApiError(err, "Could not update status."));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-black">Drivers</h1>
          <p className="text-sm text-black">
            {pagination?.total ?? users.length} total drivers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px] sm:flex-none sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search drivers"
              className="h-11 w-full pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
            />
          </div>
          <Link
            href="/dashboard/drivers/new"
            className="h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add driver
          </Link>
        </div>
      </div>

      {actionError && <p className="mb-4 text-sm font-medium text-red-500">{actionError}</p>}

      {loading ? (
        <p className="text-sm text-black">Loading drivers…</p>
      ) : error ? (
        <p className="text-sm text-red-500">Couldn&apos;t load drivers.</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-black">No drivers found.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-black">
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">License no.</th>
                <th className="py-3 px-4">Driver status</th>
                <th className="py-3 px-4">Account status</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-semibold shrink-0">
                        {(d.fullName as string)?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-black">
                        {d.fullName as string}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-black">{d.mobileNumber}</td>
                  <td className="py-3 px-4 text-black">
                    {(d.drivingLicense as { number?: string } | null)?.number || "—"}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadgeSelect
                      value={(d.driverStatus as string) || "pending"}
                      options={DRIVER_STATUSES}
                      styleMap={driverStatusStyle}
                      disabled={updatingId === d.id}
                      onChange={(v) => handleStatusChange(d.id, "driverStatus", v)}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadgeSelect
                      value={(d.centralStatus as string) || "active"}
                      options={CENTRAL_STATUSES}
                      styleMap={centralStatusStyle}
                      disabled={updatingId === d.id}
                      onChange={(v) => handleStatusChange(d.id, "centralStatus", v)}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/dashboard/drivers/${d.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-black hover:text-blue-600 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                      <Link
                        href={`/dashboard/drivers/${d.id}/edit`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Link>
                    </div>
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
