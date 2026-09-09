"use client";

import { useState } from "react";
import Link from "next/link";
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
  const [search, setSearch] = useState("");
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

    setActionError("");
    setUpdatingId(driverId);

    try {
      await updateAccountControl(driverId, { [field]: value }, token);
      await reload();
    } catch (err) {
      setActionError(formatApiError(err, "Could not update status."));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Drivers</h1>
          <p className="text-sm text-slate-500">
            {pagination?.total ?? users.length} total drivers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search drivers"
              className="h-11 w-64 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
            />
          </div>
          <Link
            href="/dashboard/drivers/new"
            className="h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            Add driver
          </Link>
        </div>
      </div>

      {actionError && <p className="mb-4 text-sm font-medium text-red-500">{actionError}</p>}

      {loading ? (
        <p className="text-sm text-slate-400">Loading drivers…</p>
      ) : error ? (
        <p className="text-sm text-red-500">Couldn&apos;t load drivers.</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-slate-400">No drivers found.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
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
                      <span className="font-medium text-slate-900">
                        {d.fullName as string}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{d.mobileNumber}</td>
                  <td className="py-3 px-4 text-slate-600">
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
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 transition"
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
