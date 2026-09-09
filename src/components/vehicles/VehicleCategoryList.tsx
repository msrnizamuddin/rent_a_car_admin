"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useVehicleCategories } from "@/hooks/useVehicleCategories";
import { deleteVehicleCategory, updateVehicleCategory } from "@/services/vehicleCategoryService";
import { formatApiError } from "@/lib/errorMessages";
import StatusBadgeSelect from "@/components/shared/StatusBadgeSelect";

const STATUSES = ["active", "inactive"] as const;

const statusStyle: Record<string, string> = {
  active: "bg-green-50 text-green-600",
  inactive: "bg-slate-100 text-black",
};

export default function VehicleCategoryList() {
  const { token } = useAuth();
  const { categories, loading, error, reload } = useVehicleCategories();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const handleStatusChange = async (id: string, status: string) => {
    if (!token) return;

    setActionError("");
    setBusyId(id);

    try {
      await updateVehicleCategory(id, { status }, token);
      await reload();
    } catch (err) {
      setActionError(formatApiError(err, "Could not update status."));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!token) return;
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;

    setActionError("");
    setBusyId(id);

    try {
      await deleteVehicleCategory(id, token);
      await reload();
    } catch (err) {
      setActionError(formatApiError(err, "Could not delete category."));
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-black">Vehicle Categories</h1>
          <p className="text-sm text-black">{categories.length} total categories</p>
        </div>

        <Link
          href="/dashboard/vehicle-categories/new"
          className="h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          Add category
        </Link>
      </div>

      {actionError && <p className="mb-4 text-sm font-medium text-red-500">{actionError}</p>}

      {loading ? (
        <p className="text-sm text-black">Loading categories…</p>
      ) : error ? (
        <p className="text-sm text-red-500">Couldn&apos;t load categories.</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-black">No categories yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-black">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {c.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.image}
                          alt={c.name}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <p className="font-medium text-black">{c.name}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-black">{c.description || "—"}</td>
                  <td className="py-3 px-4">
                    <StatusBadgeSelect
                      value={c.status}
                      options={STATUSES}
                      styleMap={statusStyle}
                      disabled={busyId === c.id}
                      onChange={(v) => handleStatusChange(c.id, v)}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/dashboard/vehicle-categories/${c.id}/edit`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Link>
                      <button
                        type="button"
                        disabled={busyId === c.id}
                        onClick={() => handleDelete(c.id, c.name)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 disabled:opacity-60 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
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
