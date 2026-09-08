"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useVehicleCategories } from "@/hooks/useVehicleCategories";
import { createVehicle } from "@/services/vehicleService";
import { formatApiError } from "@/lib/errorMessages";
import {
  VEHICLE_TYPES,
  FUEL_TYPES,
  TRANSMISSIONS,
} from "@/constants/vehicle.constants";

const inputClass =
  "w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition";

const labelClass = "text-xs font-medium text-slate-500 mb-1.5 block";

export default function VehicleForm() {
  const router = useRouter();
  const { token } = useAuth();
  const { categories } = useVehicleCategories();

  const [form, setForm] = useState({
    vehicleName: "",
    brand: "",
    vehicleModel: "",
    categoryId: "",
    vehicleType: VEHICLE_TYPES[0] as string,
    registrationNumber: "",
    modelYear: String(new Date().getFullYear()),
    seatingCapacity: "5",
    fuelType: FUEL_TYPES[0] as string,
    transmission: TRANSMISSIONS[0] as string,
    color: "",
    city: "",
    address: "",
    perDay: "",
    perHour: "",
    perKm: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError("");
    setSubmitting(true);

    if (!form.categoryId) {
      setError("Please select a category.");
      setSubmitting(false);
      return;
    }

    // The backend rejects estimatedRentalRate as an empty object — only
    // send it at all when at least one rate field was actually filled in.
    const rate = {
      perDay: form.perDay ? Number(form.perDay) : undefined,
      perHour: form.perHour ? Number(form.perHour) : undefined,
      perKm: form.perKm ? Number(form.perKm) : undefined,
    };
    const hasRate = Object.values(rate).some((v) => v !== undefined);

    try {
      await createVehicle(
        {
          vehicleName: form.vehicleName,
          brand: form.brand,
          vehicleModel: form.vehicleModel,
          categoryId: form.categoryId,
          vehicleType: form.vehicleType,
          registrationNumber: form.registrationNumber,
          modelYear: Number(form.modelYear),
          seatingCapacity: Number(form.seatingCapacity),
          fuelType: form.fuelType,
          transmission: form.transmission,
          color: form.color || undefined,
          location: { city: form.city, address: form.address || undefined },
          ...(hasRate ? { estimatedRentalRate: rate } : {}),
        },
        token,
      );

      router.push("/dashboard/vehicles");
    } catch (err) {
      setError(formatApiError(err, "Could not add vehicle, please try again."));
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Add vehicle</h1>
        <p className="text-sm text-slate-500">
          Enter vehicle details to add it to the fleet.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Vehicle name</label>
            <input
              required
              value={form.vehicleName}
              onChange={update("vehicleName")}
              placeholder="Axio"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Brand</label>
            <input
              required
              value={form.brand}
              onChange={update("brand")}
              placeholder="Toyota"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Model</label>
            <input
              required
              value={form.vehicleModel}
              onChange={update("vehicleModel")}
              placeholder="Axio X"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select
              required
              value={form.categoryId}
              onChange={update("categoryId")}
              className={inputClass}
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
            <label className={labelClass}>Vehicle type</label>
            <select
              required
              value={form.vehicleType}
              onChange={update("vehicleType")}
              className={inputClass}
            >
              {VEHICLE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Registration number</label>
            <input
              required
              value={form.registrationNumber}
              onChange={update("registrationNumber")}
              placeholder="DHAKA-METRO-GA-1234"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Model year</label>
            <input
              required
              type="number"
              value={form.modelYear}
              onChange={update("modelYear")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Seating capacity</label>
            <input
              required
              type="number"
              value={form.seatingCapacity}
              onChange={update("seatingCapacity")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Fuel type</label>
            <select value={form.fuelType} onChange={update("fuelType")} className={inputClass}>
              {FUEL_TYPES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Transmission</label>
            <select
              value={form.transmission}
              onChange={update("transmission")}
              className={inputClass}
            >
              {TRANSMISSIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Color (optional)</label>
            <input value={form.color} onChange={update("color")} className={inputClass} />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Pickup location</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>City</label>
              <input
                required
                value={form.city}
                onChange={update("city")}
                placeholder="Dhaka"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Address (optional)</label>
              <input value={form.address} onChange={update("address")} className={inputClass} />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            Estimated rental rate (optional)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Per day (৳)</label>
              <input
                type="number"
                value={form.perDay}
                onChange={update("perDay")}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Per hour (৳)</label>
              <input
                type="number"
                value={form.perHour}
                onChange={update("perHour")}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Per km (৳)</label>
              <input
                type="number"
                value={form.perKm}
                onChange={update("perKm")}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {error && <p className="text-sm font-medium text-red-500">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition"
          >
            {submitting ? "Saving..." : "Save vehicle"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/vehicles")}
            className="h-11 px-6 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
