"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useVehicleCategories } from "@/hooks/useVehicleCategories";
import { useUsers } from "@/hooks/useUsers";
import { createVehicle, getVehicleById, updateVehicle } from "@/services/vehicleService";
import { formatApiError } from "@/lib/errorMessages";
import DocumentUpload from "@/components/shared/DocumentUpload";
import type { UploadedDocument } from "@/services/documentService";
import {
  VEHICLE_TYPES,
  FUEL_TYPES,
  TRANSMISSIONS,
} from "@/constants/vehicle.constants";

const inputClass =
  "w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition";

const labelClass = "text-xs font-medium text-slate-500 mb-1.5 block";

// Minimum required for a vehicle to be considered "fully documented":
// 5 plate-visible photos + registration copy + tax token + fitness cert.
const REQUIRED_VEHICLE_PHOTOS = 5;
const REQUIRED_VEHICLE_DOCS = REQUIRED_VEHICLE_PHOTOS + 3;

type VehicleFormProps = {
  // Present in edit mode — PATCHes the existing vehicle instead of creating one.
  vehicleId?: string;
};

const emptyForm = {
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
  ownerDriverId: "",
};

function CollapsibleSection({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-100 rounded-2xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-slate-800">{title}</span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export default function VehicleForm({ vehicleId }: VehicleFormProps) {
  const router = useRouter();
  const { token } = useAuth();
  const { categories } = useVehicleCategories();
  const { users: drivers } = useUsers({ role: "driver", limit: 200 });
  const isEdit = Boolean(vehicleId);

  const [form, setForm] = useState(emptyForm);
  // A vehicle can support more than one fuel type — kept separate from
  // `form` since it isn't a single input's value.
  const [fuelTypes, setFuelTypes] = useState<string[]>([FUEL_TYPES[0] as string]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // In create mode, the vehicle is created first (docs need a real
  // ownerId), then this holds the new id so the document step shows.
  const [createdVehicleId, setCreatedVehicleId] = useState<string | null>(vehicleId || null);

  const [vehiclePhotos, setVehiclePhotos] = useState<Array<UploadedDocument | null>>(
    Array(REQUIRED_VEHICLE_PHOTOS).fill(null),
  );
  const [registrationCopy, setRegistrationCopy] = useState<UploadedDocument | null>(null);
  const [taxToken, setTaxToken] = useState<UploadedDocument | null>(null);
  const [fitnessCertificate, setFitnessCertificate] = useState<UploadedDocument | null>(null);

  const uploadedCount =
    vehiclePhotos.filter(Boolean).length +
    [registrationCopy, taxToken, fitnessCertificate].filter(Boolean).length;
  const isFullyDocumented = uploadedCount >= REQUIRED_VEHICLE_DOCS;

  useEffect(() => {
    if (!vehicleId || !token) return;

    setLoading(true);
    getVehicleById(vehicleId, token)
      .then((vehicle) => {
        setForm({
          vehicleName: vehicle.vehicleName || "",
          brand: vehicle.brand || "",
          vehicleModel: vehicle.vehicleModel || "",
          categoryId: vehicle.categoryId || "",
          vehicleType: vehicle.vehicleType || (VEHICLE_TYPES[0] as string),
          registrationNumber: vehicle.registrationNumber || "",
          modelYear: String(vehicle.modelYear || new Date().getFullYear()),
          seatingCapacity: String(vehicle.seatingCapacity || 5),
          transmission: vehicle.transmission || (TRANSMISSIONS[0] as string),
          color: vehicle.color || "",
          ownerDriverId: vehicle.ownerDriverId || "",
        });
        setFuelTypes(vehicle.fuelType?.length ? vehicle.fuelType : [FUEL_TYPES[0] as string]);
      })
      .catch((err) => setError(formatApiError(err, "Could not load vehicle.")))
      .finally(() => setLoading(false));
  }, [vehicleId, token]);

  const update =
    (key: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const toggleFuelType = (type: string) =>
    setFuelTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );

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

    if (fuelTypes.length === 0) {
      setError("Please select at least one fuel type.");
      setSubmitting(false);
      return;
    }

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
      if (isEdit && vehicleId) {
        await updateVehicle(vehicleId, { ...payload, ownerDriverId: form.ownerDriverId || null }, token);
        router.push("/dashboard/vehicles");
      } else {
        const created = await createVehicle(
          { ...payload, ...(form.ownerDriverId ? { ownerDriverId: form.ownerDriverId } : {}) },
          token,
        );
        setCreatedVehicleId(created.id);
      }
    } catch (err) {
      setError(formatApiError(err, "Could not save vehicle, please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-400">Loading vehicle…</p>;
  }

  // Create flow, phase 2: vehicle already exists — collect required documents.
  if (createdVehicleId && !isEdit) {
    return (
      <div className="max-w-3xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900">Add vehicle documents</h1>
          <p className="text-sm text-slate-500">
            Vehicle created. Upload at least {REQUIRED_VEHICLE_DOCS} documents to mark it fully
            documented — {REQUIRED_VEHICLE_PHOTOS} photos with the number plate visible,
            registration copy, tax token, and fitness certificate.
          </p>
        </div>

        <div className="space-y-6">
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
            <h2 className="text-sm font-semibold text-slate-800 mb-3">
              Vehicle photos (number plate visible)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vehiclePhotos.map((photo, i) => (
                <DocumentUpload
                  key={i}
                  label={`Photo ${i + 1}`}
                  category="vehicle_photo"
                  ownerType="vehicle"
                  ownerId={createdVehicleId}
                  value={photo}
                  onUploaded={(doc) =>
                    setVehiclePhotos((prev) => prev.map((p, idx) => (idx === i ? doc : p)))
                  }
                  onRemove={() =>
                    setVehiclePhotos((prev) => prev.map((p, idx) => (idx === i ? null : p)))
                  }
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-800 mb-3">Paperwork</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DocumentUpload
                label="Registration copy"
                category="registration_copy"
                ownerType="vehicle"
                ownerId={createdVehicleId}
                value={registrationCopy}
                onUploaded={setRegistrationCopy}
                onRemove={() => setRegistrationCopy(null)}
              />
              <DocumentUpload
                label="Tax token"
                category="tax_token"
                ownerType="vehicle"
                ownerId={createdVehicleId}
                value={taxToken}
                onUploaded={setTaxToken}
                onRemove={() => setTaxToken(null)}
              />
              <DocumentUpload
                label="Fitness certificate"
                category="fitness_certificate"
                ownerType="vehicle"
                ownerId={createdVehicleId}
                value={fitnessCertificate}
                onUploaded={setFitnessCertificate}
                onRemove={() => setFitnessCertificate(null)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              disabled={!isFullyDocumented}
              onClick={() => router.push("/dashboard/vehicles")}
              className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition"
            >
              Done
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/vehicles")}
              className="h-11 px-6 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Finish later
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">
          {isEdit ? "Edit vehicle" : "Add vehicle"}
        </h1>
        <p className="text-sm text-slate-500">
          {isEdit ? "Update this vehicle's details." : "Enter vehicle details to add it to the fleet."}
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
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-400"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        <CollapsibleSection
          title="Driver-owned vehicle (optional)"
          defaultOpen={Boolean(form.ownerDriverId)}
        >
          <p className="text-xs text-slate-500 mb-3">
            Set this when a driver brought their own car, rather than this being a company
            fleet vehicle any admin can assign.{" "}
            {isEdit
              ? "Clear the selection to make it a fleet vehicle again."
              : "Unless you also set an assignment below, the vehicle is assigned to its owner automatically."}
          </p>
          <select
            value={form.ownerDriverId}
            onChange={update("ownerDriverId")}
            className={inputClass}
          >
            <option value="">Not driver-owned</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.fullName as string}
              </option>
            ))}
          </select>
        </CollapsibleSection>

        {error && <p className="text-sm font-medium text-red-500">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition"
          >
            {submitting ? "Saving..." : isEdit ? "Save changes" : "Create vehicle"}
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
