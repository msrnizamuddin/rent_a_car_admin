"use client";

// src/components/drivers/DriverOwnVehicle.tsx
//
// "Driver may have his own vehicle" — a self-contained section for the
// driver add/edit flow. Looks up whether this driver already owns a
// vehicle (Vehicle.ownerDriverId); if not, lets the admin register one
// (createVehicle with ownerDriverId set, which the backend auto-assigns to
// this driver); once the vehicle exists, shows the same document
// requirements as the Vehicle module (5 plate-visible photos +
// registration copy + tax token + fitness certificate).

import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useVehicleCategories } from "@/hooks/useVehicleCategories";
import { createVehicle, getAllVehicles, updateVehicle } from "@/services/vehicleService";
import { formatApiError } from "@/lib/errorMessages";
import DocumentUpload from "@/components/shared/DocumentUpload";
import type { UploadedDocument } from "@/services/documentService";
import { VEHICLE_TYPES, FUEL_TYPES, TRANSMISSIONS } from "@/constants/vehicle.constants";

const inputClass =
  "w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-black placeholder:text-black outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition";

const labelClass = "text-xs font-medium text-black mb-1.5 block";

const REQUIRED_VEHICLE_PHOTOS = 5;
const REQUIRED_VEHICLE_DOCS = REQUIRED_VEHICLE_PHOTOS + 3;

const emptyVehicleForm = {
  vehicleName: "",
  brand: "",
  vehicleModel: "",
  categoryId: "",
  vehicleType: VEHICLE_TYPES[0] as string,
  registrationNumber: "",
  modelYear: String(new Date().getFullYear()),
  seatingCapacity: "5",
  transmission: TRANSMISSIONS[0] as string,
  color: "",
};

type Props = { driverId: string };

export default function DriverOwnVehicle({ driverId }: Props) {
  const { token } = useAuth();
  const { categories } = useVehicleCategories();

  const [loading, setLoading] = useState(true);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyVehicleForm);
  const [fuelTypes, setFuelTypes] = useState<string[]>([FUEL_TYPES[0] as string]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [photos, setPhotos] = useState<Array<UploadedDocument | null>>(
    Array(REQUIRED_VEHICLE_PHOTOS).fill(null),
  );
  const [registrationCopy, setRegistrationCopy] = useState<UploadedDocument | null>(null);
  const [taxToken, setTaxToken] = useState<UploadedDocument | null>(null);
  const [fitnessCertificate, setFitnessCertificate] = useState<UploadedDocument | null>(null);

  const uploadedCount =
    photos.filter(Boolean).length +
    [registrationCopy, taxToken, fitnessCertificate].filter(Boolean).length;
  const isFullyDocumented = uploadedCount >= REQUIRED_VEHICLE_DOCS;

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    getAllVehicles(token)
      .then((vehicles) => {
        const owned = vehicles.find((v) => v.ownerDriverId === driverId);
        if (owned) {
          setVehicleId(owned.id);
          setForm({
            vehicleName: owned.vehicleName || "",
            brand: owned.brand || "",
            vehicleModel: owned.vehicleModel || "",
            categoryId: owned.categoryId || "",
            vehicleType: owned.vehicleType || (VEHICLE_TYPES[0] as string),
            registrationNumber: owned.registrationNumber || "",
            modelYear: String(owned.modelYear || new Date().getFullYear()),
            seatingCapacity: String(owned.seatingCapacity || 5),
            transmission: owned.transmission || (TRANSMISSIONS[0] as string),
            color: owned.color || "",
          });
          setFuelTypes(owned.fuelType?.length ? owned.fuelType : [FUEL_TYPES[0] as string]);
        }
      })
      .catch((err) => setError(formatApiError(err, "Could not check for an owned vehicle.")))
      .finally(() => setLoading(false));
  }, [driverId, token]);

  const update =
    (key: keyof typeof emptyVehicleForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const toggleFuelType = (type: string) =>
    setFuelTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );

  const handleSaveVehicle = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError("");

    if (!form.categoryId) {
      setError("Please select a category.");
      return;
    }
    if (fuelTypes.length === 0) {
      setError("Please select at least one fuel type.");
      return;
    }

    setSubmitting(true);

    const payload = {
      vehicleName: form.vehicleName,
      brand: form.brand,
      vehicleModel: form.vehicleModel,
      categoryId: form.categoryId,
      vehicleType: form.vehicleType,
      registrationNumber: form.registrationNumber,
      modelYear: Number(form.modelYear),
      seatingCapacity: Number(form.seatingCapacity),
      fuelType: fuelTypes,
      transmission: form.transmission,
      color: form.color || undefined,
    };

    try {
      if (vehicleId) {
        await updateVehicle(vehicleId, payload, token);
      } else {
        const created = await createVehicle({ ...payload, ownerDriverId: driverId }, token);
        setVehicleId(created.id);
      }
    } catch (err) {
      setError(formatApiError(err, "Could not save vehicle, please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-black">Checking for an owned vehicle…</p>;
  }

  return (
    <div className="border border-slate-100 rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-black mb-1">Driver&apos;s own vehicle</h2>
      <p className="text-xs text-black mb-4">
        If this driver brought their own car — rather than driving a fleet vehicle assigned to
        them — register it here.
      </p>

      {!vehicleId && !showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="h-10 px-4 rounded-xl border border-slate-200 text-sm font-medium text-black hover:bg-slate-50 transition"
        >
          + Add driver&apos;s own vehicle
        </button>
      ) : (
        <form onSubmit={handleSaveVehicle} className="space-y-4">
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
            <label className={labelClass}>Fuel type</label>
            <div className="flex flex-wrap gap-2">
              {FUEL_TYPES.map((f) => {
                const checked = fuelTypes.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFuelType(f)}
                    aria-pressed={checked}
                    className={`h-9 px-3.5 rounded-lg border text-sm font-medium capitalize transition ${
                      checked
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-slate-50 border-slate-200 text-black hover:border-blue-400"
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm font-medium text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition"
          >
            {submitting ? "Saving..." : vehicleId ? "Save vehicle info" : "Create vehicle"}
          </button>
        </form>
      )}

      {vehicleId && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            {isFullyDocumented ? (
              <span className="flex items-center gap-1.5 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                Fully documented ({uploadedCount}/{REQUIRED_VEHICLE_DOCS})
              </span>
            ) : (
              <span className="text-amber-600">
                {uploadedCount}/{REQUIRED_VEHICLE_DOCS} required documents uploaded
              </span>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-black mb-3">
              Vehicle photos (number plate visible)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {photos.map((photo, i) => (
                <DocumentUpload
                  key={i}
                  label={`Photo ${i + 1}`}
                  category="vehicle_photo"
                  ownerType="vehicle"
                  ownerId={vehicleId}
                  value={photo}
                  onUploaded={(doc) =>
                    setPhotos((prev) => prev.map((p, idx) => (idx === i ? doc : p)))
                  }
                  onRemove={() =>
                    setPhotos((prev) => prev.map((p, idx) => (idx === i ? null : p)))
                  }
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-black mb-3">Paperwork</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DocumentUpload
                label="Registration copy"
                category="registration_copy"
                ownerType="vehicle"
                ownerId={vehicleId}
                value={registrationCopy}
                onUploaded={setRegistrationCopy}
                onRemove={() => setRegistrationCopy(null)}
              />
              <DocumentUpload
                label="Tax token"
                category="tax_token"
                ownerType="vehicle"
                ownerId={vehicleId}
                value={taxToken}
                onUploaded={setTaxToken}
                onRemove={() => setTaxToken(null)}
              />
              <DocumentUpload
                label="Fitness certificate"
                category="fitness_certificate"
                ownerType="vehicle"
                ownerId={vehicleId}
                value={fitnessCertificate}
                onUploaded={setFitnessCertificate}
                onRemove={() => setFitnessCertificate(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
