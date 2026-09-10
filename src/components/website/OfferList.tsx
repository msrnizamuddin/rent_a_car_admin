"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Plus, ImageOff } from "lucide-react";
import { useOffers } from "@/hooks/useOffers";

const statusStyle: Record<string, string> = {
  active: "bg-green-50 text-green-600",
  inactive: "bg-slate-100 text-slate-500",
};

const tripTypeLabel: Record<string, string> = {
  round_trip: "Round Trip",
  one_way: "One Way",
  discount_trip: "Discount Trip",
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function OfferList() {
  const [search, setSearch] = useState("");
  const { offers, loading, error } = useOffers();

  const filteredOffers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return offers;
    return offers.filter((o) =>
      [o.title, o.subtitle, o.fromLocation, o.toLocation]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q)),
    );
  }, [offers, search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Offers</h1>
          <p className="text-sm text-slate-500">
            {filteredOffers.length} total offers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search offers"
              className="h-11 w-64 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
            />
          </div>
          <Link
            href="/dashboard/offers/new"
            className="h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            Create offer
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading offers…</p>
      ) : error ? (
        <p className="text-sm text-red-500">Couldn&apos;t load offers.</p>
      ) : filteredOffers.length === 0 ? (
        <p className="text-sm text-slate-400">No offers found.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                <th className="py-3 px-4">Offer</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Trip type</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOffers.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {o.bannerImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={o.bannerImage}
                          alt={o.title}
                          className="w-12 h-9 rounded-lg object-cover shrink-0 bg-slate-100"
                        />
                      ) : (
                        <div className="w-12 h-9 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                          <ImageOff className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {o.title}
                        </p>
                        {o.subtitle && (
                          <p className="text-xs text-slate-500 truncate">
                            {o.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                    {o.fromLocation || "—"} → {o.toLocation || "—"}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-medium">
                      {(o.tripType && tripTypeLabel[o.tripType]) ||
                        o.tripType ||
                        "—"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                    {o.discountType === "percentage"
                      ? `${Number(o.discountValue)}%`
                      : `৳${Number(o.discountValue)}`}
                  </td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                    {formatDate(o.startDate)} – {formatDate(o.endDate)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        statusStyle[o.status]
                      }`}
                    >
                      {o.status === "active" ? "Active" : "Inactive"}
                    </span>
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
