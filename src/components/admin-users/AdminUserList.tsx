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
import { centralStatusStyle } from "@/components/drivers/DriverStatusControl";
import { CENTRAL_STATUSES } from "@/constants/user.constants";
import { PERMISSION_MODULES, PERMISSION_LABELS } from "@/constants/permissions.constants";

export default function AdminUserList() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  // Sub-users are always created with role "manager" — superadmin accounts
  // never show up here, since this list only ever asks for role=manager.
  const { users, pagination, loading, error, reload } = useUsers({
    role: "manager",
    search: search || undefined,
    limit: 50,
  });

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const handleStatusChange = async (userId: string, value: string) => {
    if (!token) return;

    let reason: string | undefined;
    if (value === "inactive") {
      const entered = window.prompt("Why is this admin user being deactivated?");
      if (!entered || !entered.trim()) return;
      reason = entered.trim();
    }

    setActionError("");
    setUpdatingId(userId);

    try {
      await updateAccountControl(
        userId,
        { centralStatus: value as "active" | "inactive" | "suspended" | "blocked", ...(reason ? { reason } : {}) },
        token,
      );
      await reload();
    } catch (err) {
      setActionError(formatApiError(err, "Could not update status."));
    } finally {
      setUpdatingId(null);
    }
  };

  const permissionSummary = (permissions: unknown) => {
    const map = (permissions as Record<string, boolean>) || {};
    const granted = PERMISSION_MODULES.filter((m) => map[m]);
    if (!granted.length) return "No access granted";
    if (granted.length === PERMISSION_MODULES.length) return "Full access";
    return granted.map((m) => PERMISSION_LABELS[m]).join(", ");
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-black">Admin Users</h1>
          <p className="text-sm text-black">
            {pagination?.total ?? users.length} admin users — managers with access scoped to
            specific modules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px] sm:flex-none sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search admin users"
              className="h-11 w-full pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-black placeholder:text-black outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
            />
          </div>
          <Link
            href="/dashboard/admin-users/new"
            className="h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add admin user
          </Link>
        </div>
      </div>

      {actionError && <p className="mb-4 text-sm font-medium text-red-500">{actionError}</p>}

      {loading ? (
        <p className="text-sm text-black">Loading admin users…</p>
      ) : error ? (
        <p className="text-sm text-red-500">Couldn&apos;t load admin users.</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-black">
          No admin users yet — add one to give someone scoped access to the admin panel.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-black">
                <th className="py-3 px-4">Admin user</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Access</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-semibold shrink-0">
                        {(u.fullName as string)?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-black">{u.fullName as string}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-black">{u.mobileNumber}</td>
                  <td className="py-3 px-4 text-black max-w-xs">
                    <span className="line-clamp-2">{permissionSummary(u.permissions)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadgeSelect
                      value={(u.centralStatus as string) || "active"}
                      options={CENTRAL_STATUSES}
                      styleMap={centralStatusStyle}
                      disabled={updatingId === u.id}
                      onChange={(v) => handleStatusChange(u.id, v)}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/dashboard/admin-users/${u.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-black hover:text-blue-600 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                      <Link
                        href={`/dashboard/admin-users/${u.id}/edit`}
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
