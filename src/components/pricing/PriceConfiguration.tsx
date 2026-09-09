"use client";

// src/components/pricing/PriceConfiguration.tsx
//
// Exactly one editable card per trip type (One Way / Round Trip / Program
// Trip) — not a general add/remove list, since a trip type either has its
// default pricing rule or doesn't yet. Saving upserts: PATCH if a rule for
// that trip type already exists, otherwise POST a new one.

import { useEffect, useState } from "react";
import { Route, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePricing } from "@/hooks/usePricing";
import { createPricing, updatePricing, type PricingRule } from "@/services/pricingService";
import { formatApiError } from "@/lib/errorMessages";
import { PRICING_TRIP_TYPES, PRICING_TRIP_TYPE_LABELS } from "@/constants/pricing.constants";

const inputClass =
  "w-full h-11 pl-8 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-black placeholder:text-black outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition";

const labelClass = "text-xs font-medium text-black mb-1.5 block";

type FormState = {
  perKmRate: string;
  viewPriceLowOffset: string;
  viewPriceHighOffset: string;
  isActive: boolean;
};

const defaultForm: FormState = {
  perKmRate: "",
  viewPriceLowOffset: "100",
  viewPriceHighOffset: "100",
  isActive: true,
};

function TripPricingCard({
  tripType,
  rule,
  onSaved,
}: {
  tripType: string;
  rule?: PricingRule;
  onSaved: () => void;
}) {
  const { token } = useAuth();
  const [form, setForm] = useState<FormState>(defaultForm);
  const [sampleKm, setSampleKm] = useState("50");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!rule) return;
    setForm({
      perKmRate: rule.perKmRate ?? "",
      viewPriceLowOffset: rule.viewPriceLowOffset ?? "100",
      viewPriceHighOffset: rule.viewPriceHighOffset ?? "100",
      isActive: rule.isActive,
    });
  }, [rule]);

  const perKm = Number(form.perKmRate) || 0;
  const km = Number(sampleKm) || 0;
  const estimate = perKm * km;
  const lowOffset = Number(form.viewPriceLowOffset) || 0;
  const highOffset = Number(form.viewPriceHighOffset) || 0;
  const viewLow = Math.max(0, estimate - lowOffset);
  const viewHigh = estimate + highOffset;

  const handleSave = async () => {
    if (!token) return;
    setError("");
    setSaved(false);

    if (!form.perKmRate || Number(form.perKmRate) < 0 || Number.isNaN(Number(form.perKmRate))) {
      setError("Enter a valid per-km rate.");
      return;
    }

    setSaving(true);
    const payload = {
      name: `${PRICING_TRIP_TYPE_LABELS[tripType]} Pricing`,
      tripType,
      perKmRate: Number(form.perKmRate),
      viewPriceLowOffset: lowOffset,
      viewPriceHighOffset: highOffset,
      isActive: form.isActive,
    };

    try {
      if (rule) {
        await updatePricing(rule.id, payload, token);
      } else {
        await createPricing(payload, token);
      }
      setSaved(true);
      onSaved();
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(formatApiError(err, "Could not save pricing."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <Route className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-black">
              {PRICING_TRIP_TYPE_LABELS[tripType]}
            </h3>
            <p className="text-xs text-black">{rule ? "Configured" : "Not set up yet"}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
          className={`w-10 h-6 rounded-full transition relative shrink-0 ${
            form.isActive ? "bg-blue-600" : "bg-slate-200"
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${
              form.isActive ? "left-[18px]" : "left-0.5"
            }`}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div>
          <label className={labelClass}>Estimated rate / km</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black">৳</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.perKmRate}
              onChange={(e) => setForm((prev) => ({ ...prev, perKmRate: e.target.value }))}
              placeholder="30"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>View price — lower by</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black">৳</span>
            <input
              type="number"
              min="0"
              step="1"
              value={form.viewPriceLowOffset}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, viewPriceLowOffset: e.target.value }))
              }
              placeholder="100"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>View price — higher by</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black">৳</span>
            <input
              type="number"
              min="0"
              step="1"
              value={form.viewPriceHighOffset}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, viewPriceHighOffset: e.target.value }))
              }
              placeholder="100"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Live preview against a sample distance, so the admin can see what
          a customer will actually be shown before saving. */}
      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <label className="text-xs font-medium text-black shrink-0">Preview for</label>
          <input
            type="number"
            min="0"
            value={sampleKm}
            onChange={(e) => setSampleKm(e.target.value)}
            className="w-20 h-8 px-2 rounded-lg bg-white border border-slate-200 text-sm text-black outline-none focus:border-blue-500"
          />
          <span className="text-xs text-black">km trip</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
          <span className="text-black">
            Actual estimate: <span className="font-semibold">৳{estimate.toFixed(0)}</span>
          </span>
          <span className="text-black">
            Customer sees:{" "}
            <span className="font-semibold text-blue-600">
              ৳{viewLow.toFixed(0)} - ৳{viewHigh.toFixed(0)}
            </span>
          </span>
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-500 mb-3">{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold flex items-center gap-2 transition"
      >
        {saved ? (
          <>
            <Check className="w-4 h-4" />
            Saved
          </>
        ) : saving ? (
          "Saving..."
        ) : (
          "Save"
        )}
      </button>
    </div>
  );
}

export default function PriceConfiguration() {
  const { rules, loading, error, reload } = usePricing();

  const ruleFor = (tripType: string) =>
    rules.find((r) => r.tripType === tripType && !r.categoryId && !r.vehicleId);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-black">Price Configuration</h1>
        <p className="text-sm text-black">
          Set a per-km rate for each trip type, plus how much the price customers see on the
          website should vary from the real estimate — applied once a distance is known from
          the search bar.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-black">Loading pricing…</p>
      ) : error ? (
        <p className="text-sm text-red-500">Couldn&apos;t load pricing.</p>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {PRICING_TRIP_TYPES.map((tripType) => (
            <TripPricingCard
              key={tripType}
              tripType={tripType}
              rule={ruleFor(tripType)}
              onSaved={reload}
            />
          ))}
        </div>
      )}
    </div>
  );
}
