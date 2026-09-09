"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTouristSpots } from "@/hooks/useTouristSpots";
import { deleteTouristSpot, updateTouristSpot } from "@/services/touristSpotService";
import { formatApiError } from "@/lib/errorMessages";
import StatusBadgeSelect from "@/components/shared/StatusBadgeSelect";
import { TOURIST_SPOT_STATUSES } from "@/constants/touristSpot.constants";

const statusStyle: Record<string, string> = {
  active: "bg-green-50 text-green-600",
  inactive: "bg-slate-100 text-black",
};

export default function TouristSpotList() {
  const { token } = useAuth();
  const { touristSpots, loading, error, reload } = useTouristSpots();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const handleStatusChange = async (id: string, status: string) => {
    if (!token) return;

    setActionError("");
    setBusyId(id);

    try {
      await updateTouristSpot(id, { status: status as "active" | "inactive" }, token);
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
      await deleteTouristSpot(id, token);
      await reload();
    } catch (err) {
      setActionError(formatApiError(err, "Could not delete tourist spot."));
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-black">Tourist Spots</h1>
          <p className="text-sm text-black">{touristSpots.length} total spots</p>
        </div>

        <Link
          href="/dashboard/tourist-spots/new"
          className="h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          Add tourist spot
        </Link>
      </div>

      {actionError && <p className="mb-4 text-sm font-medium text-red-500">{actionError}</p>}

      {loading ? (
        <p className="text-sm text-black">Loading tourist spots…</p>
      ) : error ? (
        <p className="text-sm text-red-500">Couldn&apos;t load tourist spots.</p>
      ) : touristSpots.length === 0 ? (
        <p className="text-sm text-black">No tourist spots yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-black">
                <th className="py-3 px-4">Spot</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {touristSpots.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {s.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.image}
                          alt={s.name}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4 text-black" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-black">{s.name}</p>
                        {s.description && (
                          <p className="text-xs text-black line-clamp-1 max-w-xs">
                            {s.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-black">{s.location || "—"}</td>
                  <td className="py-3 px-4">
                    <StatusBadgeSelect
                      value={s.status}
                      options={TOURIST_SPOT_STATUSES}
                      styleMap={statusStyle}
                      disabled={busyId === s.id}
                      onChange={(v) => handleStatusChange(s.id, v)}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/dashboard/tourist-spots/${s.id}/edit`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Link>
                      <button
                        type="button"
                        disabled={busyId === s.id}
                        onClick={() => handleDelete(s.id, s.name)}
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
