"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Clock, Route, Wallet } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useVehicleCategories } from "@/hooks/useVehicleCategories";
import {
  createPricing,
  getPricingById,
  updatePricing,
} from "@/services/pricingService";
import { formatApiError } from "@/lib/errorMessages";
import { VEHICLE_CONDITIONS } from "@/constants/vehicle.constants";
import { PRICING_CONDITION_LABELS } from "@/constants/pricing.constants";

const inputClass =
  "w-full h-11 pl-8 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-black placeholder:text-black outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition";

const plainInputClass =
  "w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-black placeholder:text-black outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition";

const labelClass = "text-xs font-medium text-black mb-1.5 block";

type PricingFormProps = {
  // Present in edit mode — PATCHes the existing rule instead of creating one.
  pricingId?: string;
};

const emptyForm = {
  categoryId: "",
  vehicleCondition: VEHICLE_CONDITIONS[0] as string,
  basePrice: "",
  baseHours: "",
  includedKm: "",
  extraKmCharge: "",
  extraHourPrice: "",
  isActive: true,
};

export default function PricingForm({ pricingId }: PricingFormProps) {
  const router = useRouter();
  const { token } = useAuth();
  const { categories } = useVehicleCategories();
  const isEdit = Boolean(pricingId);

  const [form, setForm] = useState(emptyForm);
  const [sampleKm, setSampleKm] = useState("217");
  const [sampleHours, setSampleHours] = useState("5");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pricingId || !token) return;

    setLoading(true);
    getPricingById(pricingId, token)
      .then((rule) => {
        setForm({
          categoryId: rule.categoryId || "",
          vehicleCondition: rule.vehicleCondition || (VEHICLE_CONDITIONS[0] as string),
          basePrice: rule.basePrice ?? "",
          baseHours: rule.baseHours ?? "",
          includedKm: rule.includedKm ?? "",
          extraKmCharge: rule.extraKmCharge ?? "",
          extraHourPrice: rule.extraHourPrice ?? "",
          isActive: rule.isActive,
        });
      })
      .catch((err) => setError(formatApiError(err, "Could not load pricing rule.")))
      .finally(() => setLoading(false));
  }, [pricingId, token]);

  const update =
    (key: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const basePrice = Number(form.basePrice) || 0;
  const baseHours = Number(form.baseHours) || 0;
  const includedKm = Number(form.includedKm) || 0;
  const extraKmCharge = Number(form.extraKmCharge) || 0;
  const extraHourPrice = Number(form.extraHourPrice) || 0;

  const km = Number(sampleKm) || 0;
  const hours = Number(sampleHours) || 0;
  const extraKm = Math.max(0, km - includedKm);
  const extraHours = Math.max(0, hours - baseHours);
  const total = basePrice + extraKm * extraKmCharge + extraHours * extraHourPrice;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError("");

    if (!form.categoryId) {
      setError("Please select a vehicle category.");
      return;
    }
    if (!form.basePrice || !form.baseHours || !form.includedKm) {
      setError("Please fill in base price, base hours, and included KM.");
      return;
    }
    if (!form.extraKmCharge || !form.extraHourPrice) {
      setError("Please fill in the extra KM and extra hour prices.");
      return;
    }

    setSubmitting(true);

    const categoryName = categories.find((c) => c.id === form.categoryId)?.name || "Category";
    const conditionLabel = PRICING_CONDITION_LABELS[form.vehicleCondition] || form.vehicleCondition;

    const payload = {
      name: `${categoryName} — ${conditionLabel}`,
      categoryId: form.categoryId,
      vehicleCondition: form.vehicleCondition as "new" | "old",
      basePrice: Number(form.basePrice),
      baseHours: Number(form.baseHours),
      includedKm: Number(form.includedKm),
      extraKmCharge: Number(form.extraKmCharge),
      extraHourPrice: Number(form.extraHourPrice),
      isActive: form.isActive,
    };

    try {
      if (isEdit && pricingId) {
        await updatePricing(pricingId, payload, token);
      } else {
        await createPricing(payload, token);
      }
      router.push("/dashboard/price-configuration");
    } catch (err) {
      setError(formatApiError(err, "Could not save pricing rule, please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-black">Loading pricing rule…</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-black">
          {isEdit ? "Edit price configuration" : "Add price configuration"}
        </h1>
        <p className="text-sm text-black">
          Set the base package and overage rates for one vehicle category and condition.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Vehicle category (type)</label>
            <select
              required
              value={form.categoryId}
              onChange={update("categoryId")}
              className={plainInputClass}
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Condition</label>
            <select
              value={form.vehicleCondition}
              onChange={update("vehicleCondition")}
              className={plainInputClass}
            >
              {VEHICLE_CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {PRICING_CONDITION_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Base hours</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
              <input
                required
                type="number"
                min="0"
                step="0.5"
                value={form.baseHours}
                onChange={update("baseHours")}
                placeholder="8"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Included KM</label>
            <div className="relative">
              <Route className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
              <input
                required
                type="number"
                min="0"
                value={form.includedKm}
                onChange={update("includedKm")}
                placeholder="80"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Base price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black">
                ৳
              </span>
              <input
                required
                type="number"
                min="0"
                value={form.basePrice}
                onChange={update("basePrice")}
                placeholder="3500"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Extra KM price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black">
                ৳
              </span>
              <input
                required
                type="number"
                min="0"
                value={form.extraKmCharge}
                onChange={update("extraKmCharge")}
                placeholder="20"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Extra hour price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black">
                ৳
              </span>
              <input
                required
                type="number"
                min="0"
                value={form.extraHourPrice}
                onChange={update("extraHourPrice")}
                placeholder="200"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Live preview against a sample trip, so the admin can see the
            calculated total before saving. */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Wallet className="w-4 h-4 text-blue-600 shrink-0" />
            <label className="text-xs font-medium text-black shrink-0">Preview for a</label>
            <input
              type="number"
              min="0"
              value={sampleKm}
              onChange={(e) => setSampleKm(e.target.value)}
              className="w-20 h-8 px-2 rounded-lg bg-white border border-slate-200 text-sm text-black outline-none focus:border-blue-500"
            />
            <span className="text-xs text-black">km,</span>
            <input
              type="number"
              min="0"
              value={sampleHours}
              onChange={(e) => setSampleHours(e.target.value)}
              className="w-16 h-8 px-2 rounded-lg bg-white border border-slate-200 text-sm text-black outline-none focus:border-blue-500"
            />
            <span className="text-xs text-black">hour trip</span>
          </div>
          <p className="text-sm text-black">
            Base ৳{basePrice.toLocaleString()}
            {extraKm > 0 && ` + ${extraKm}km extra × ৳${extraKmCharge} = ৳${(extraKm * extraKmCharge).toLocaleString()}`}
            {extraHours > 0 && ` + ${extraHours}hr extra × ৳${extraHourPrice} = ৳${(extraHours * extraHourPrice).toLocaleString()}`}
          </p>
          <p className="text-lg font-bold text-blue-600 mt-1">
            Total: ৳{total.toLocaleString()}
          </p>
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <div className="flex gap-2 max-w-xs">
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, isActive: true }))}
              className={`flex-1 h-11 rounded-xl text-sm font-semibold transition ${
                form.isActive ? "bg-green-600 text-white" : "bg-slate-100 text-black hover:bg-slate-200"
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, isActive: false }))}
              className={`flex-1 h-11 rounded-xl text-sm font-semibold transition ${
                !form.isActive ? "bg-slate-700 text-white" : "bg-slate-100 text-black hover:bg-slate-200"
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        {error && <p className="text-sm font-medium text-red-500">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition"
          >
            {submitting ? "Saving..." : "Save price configuration"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/price-configuration")}
            className="h-11 px-6 rounded-xl border border-slate-200 text-sm font-medium text-black hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
