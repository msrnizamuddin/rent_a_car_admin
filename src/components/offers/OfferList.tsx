"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useOffers } from "@/hooks/useOffers";
import { deleteOffer, updateOffer } from "@/services/offerService";
import { formatApiError } from "@/lib/errorMessages";
import StatusBadgeSelect from "@/components/shared/StatusBadgeSelect";
import { OFFER_STATUSES, OFFER_TRIP_TYPE_LABELS } from "@/constants/offer.constants";

const statusStyle: Record<string, string> = {
  active: "bg-green-50 text-green-600",
  inactive: "bg-slate-100 text-slate-500",
};

export default function OfferList() {
  const { token } = useAuth();
  const { offers, loading, error, reload } = useOffers();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const handleStatusChange = async (id: string, status: string) => {
    if (!token) return;

    setActionError("");
    setBusyId(id);

    try {
      await updateOffer(id, { status: status as "active" | "inactive" }, token);
      await reload();
    } catch (err) {
      setActionError(formatApiError(err, "Could not update status."));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!token) return;
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;

    setActionError("");
    setBusyId(id);

    try {
      await deleteOffer(id, token);
      await reload();
    } catch (err) {
      setActionError(formatApiError(err, "Could not delete offer."));
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Offers</h1>
          <p className="text-sm text-slate-500">{offers.length} total offers</p>
        </div>

        <Link
          href="/dashboard/offers/new"
          className="h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          Add offer
        </Link>
      </div>

      {actionError && <p className="mb-4 text-sm font-medium text-red-500">{actionError}</p>}

      {loading ? (
        <p className="text-sm text-slate-400">Loading offers…</p>
      ) : error ? (
        <p className="text-sm text-red-500">Couldn&apos;t load offers.</p>
      ) : offers.length === 0 ? (
        <p className="text-sm text-slate-400">No offers yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                <th className="py-3 px-4">Offer</th>
                <th className="py-3 px-4">Trip type</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {offers.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {o.bannerImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={o.bannerImage}
                          alt={o.title}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <div>
                        <p className="font-medium text-slate-900">{o.title}</p>
                        {o.subtitle && <p className="text-xs text-slate-400">{o.subtitle}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {o.tripType ? OFFER_TRIP_TYPE_LABELS[o.tripType] || o.tripType : "—"}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {o.fromLocation || o.toLocation
                      ? `${o.fromLocation || "—"} → ${o.toLocation || "—"}`
                      : "—"}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {Number(o.discountValue)}
                    {o.discountType === "percentage" ? "%" : "৳"}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {o.startDate ? o.startDate.slice(0, 10) : "—"} –{" "}
                    {o.endDate ? o.endDate.slice(0, 10) : "—"}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadgeSelect
                      value={o.status}
                      options={OFFER_STATUSES}
                      styleMap={statusStyle}
                      disabled={busyId === o.id}
                      onChange={(v) => handleStatusChange(o.id, v)}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/dashboard/offers/${o.id}/edit`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Link>
                      <button
                        type="button"
                        disabled={busyId === o.id}
                        onClick={() => handleDelete(o.id, o.title)}
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
