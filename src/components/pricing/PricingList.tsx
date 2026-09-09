"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePricing } from "@/hooks/usePricing";
import { useVehicleCategories } from "@/hooks/useVehicleCategories";
import { deletePricing, updatePricing } from "@/services/pricingService";
import { formatApiError } from "@/lib/errorMessages";
import StatusBadgeSelect from "@/components/shared/StatusBadgeSelect";
import { PRICING_CONDITION_LABELS } from "@/constants/pricing.constants";

const STATUS_OPTIONS = ["active", "inactive"];
const statusStyle: Record<string, string> = {
  active: "bg-green-50 text-green-600",
  inactive: "bg-slate-100 text-black",
};

export default function PricingList() {
  const { token } = useAuth();
  const { rules, loading, error, reload } = usePricing();
  const { categories } = useVehicleCategories();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  // Only this screen's category+condition base-package rules — a rule
  // created by some other pricing UI (no categoryId/vehicleCondition) has
  // nothing to show here.
  const visibleRules = rules.filter((r) => r.categoryId && r.vehicleCondition);

  const categoryName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name || "—";

  const handleStatusChange = async (id: string, status: string) => {
    if (!token) return;
    setActionError("");
    setBusyId(id);
    try {
      await updatePricing(id, { isActive: status === "active" }, token);
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
      await deletePricing(id, token);
      await reload();
    } catch (err) {
      setActionError(formatApiError(err, "Could not delete pricing rule."));
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-black">Price Configuration</h1>
          <p className="text-sm text-black">
            Base package + overage rates, per vehicle category and condition.
          </p>
        </div>

        <Link
          href="/dashboard/price-configuration/new"
          className="h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          Add price configuration
        </Link>
      </div>

      {actionError && <p className="mb-4 text-sm font-medium text-red-500">{actionError}</p>}

      {loading ? (
        <p className="text-sm text-black">Loading pricing…</p>
      ) : error ? (
        <p className="text-sm text-red-500">Couldn&apos;t load pricing.</p>
      ) : visibleRules.length === 0 ? (
        <p className="text-sm text-black">
          No price configurations yet — add one for each vehicle category and condition.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-black">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Base package</th>
                <th className="py-3 px-4">Extra KM</th>
                <th className="py-3 px-4">Extra hour</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleRules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <p className="font-medium text-black">{categoryName(r.categoryId)}</p>
                  </td>
                  <td className="py-3 px-4 text-black">
                    {PRICING_CONDITION_LABELS[r.vehicleCondition || ""] || "—"}
                  </td>
                  <td className="py-3 px-4 text-black">
                    {r.baseHours}h / {r.includedKm}km — ৳{Number(r.basePrice).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-black">৳{Number(r.extraKmCharge)}/km</td>
                  <td className="py-3 px-4 text-black">৳{Number(r.extraHourPrice)}/hr</td>
                  <td className="py-3 px-4">
                    <StatusBadgeSelect
                      value={r.isActive ? "active" : "inactive"}
                      options={STATUS_OPTIONS}
                      styleMap={statusStyle}
                      disabled={busyId === r.id}
                      onChange={(v) => handleStatusChange(r.id, v)}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/dashboard/price-configuration/${r.id}/edit`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Link>
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => handleDelete(r.id, categoryName(r.categoryId))}
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
