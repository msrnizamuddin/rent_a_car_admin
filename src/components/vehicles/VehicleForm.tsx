"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Car,
  FileText,
  UserRound,
  Fuel,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useVehicleCategories } from "@/hooks/useVehicleCategories";
import { useUsers } from "@/hooks/useUsers";
import {
  createVehicle,
  getVehicleById,
  updateVehicle,
} from "@/services/vehicleService";
import { formatApiError } from "@/lib/errorMessages";
import DocumentUpload from "@/components/shared/DocumentUpload";
import {
  deleteDocument,
  getDocumentsByOwner,
  type UploadedDocument,
} from "@/services/documentService";
import {
  VEHICLE_TYPES,
  FUEL_TYPES,
  TRANSMISSIONS,
  VEHICLE_CONDITIONS,
} from "@/constants/vehicle.constants";

const inputClass =
  "w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-black placeholder:text-black/40 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition";

const labelClass = "text-xs font-medium text-black mb-1.5 block";

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
  condition: VEHICLE_CONDITIONS[0] as string,
  color: "",
  ownerDriverId: "",
};

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-slate-100 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <Icon className="w-4.5 h-4.5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-black">{title}</h2>
          {description && (
            <p className="text-xs text-black/60 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

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
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-black">
          <UserRound className="w-4 h-4 text-black/50" />
          {title}
        </span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-black" />
        ) : (
          <ChevronRight className="w-4 h-4 text-black" />
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
  const [fuelTypes, setFuelTypes] = useState<string[]>([
    FUEL_TYPES[0] as string,
  ]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // The vehicle's real id, once it exists — either passed in (edit mode)
  // or set right after a successful create. Document uploads need this
  // (a real ownerId), so the upload section stays on this same page and
  // simply unlocks once this is set, rather than navigating anywhere.
  const [savedVehicleId, setSavedVehicleId] = useState<string | null>(
    vehicleId || null,
  );

  const [vehiclePhotos, setVehiclePhotos] = useState<
    Array<UploadedDocument | null>
  >(Array(REQUIRED_VEHICLE_PHOTOS).fill(null));
  const [registrationCopy, setRegistrationCopy] =
    useState<UploadedDocument | null>(null);
  const [taxToken, setTaxToken] = useState<UploadedDocument | null>(null);
  const [fitnessCertificate, setFitnessCertificate] =
    useState<UploadedDocument | null>(null);

  const uploadedCount =
    vehiclePhotos.filter(Boolean).length +
    [registrationCopy, taxToken, fitnessCertificate].filter(Boolean).length;
  const isFullyDocumented = uploadedCount >= REQUIRED_VEHICLE_DOCS;
  const progressPct = Math.min(
    100,
    Math.round((uploadedCount / REQUIRED_VEHICLE_DOCS) * 100),
  );

  useEffect(() => {
    if (!vehicleId || !token) return;

    setLoading(true);
    Promise.all([
      getVehicleById(vehicleId, token),
      // Previously uploaded documents (each DocumentUpload persists to the
      // backend immediately on selection, independent of this form's Save
      // button) — without this, re-opening Edit always showed every slot
      // as empty, which looked like documents were never saved at all.
      getDocumentsByOwner("vehicle", vehicleId, token).catch(() => []),
    ])
      .then(([vehicle, documents]) => {
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
          condition: vehicle.condition || (VEHICLE_CONDITIONS[0] as string),
          color: vehicle.color || "",
          ownerDriverId: vehicle.ownerDriverId || "",
        });
        setFuelTypes(
          vehicle.fuelType?.length
            ? vehicle.fuelType
            : [FUEL_TYPES[0] as string],
        );

        const photos = documents.filter((d) => d.category === "vehicle_photo");
        setVehiclePhotos((prev) => prev.map((_, i) => photos[i] || null));
        setRegistrationCopy(
          documents.find((d) => d.category === "registration_copy") || null,
        );
        setTaxToken(documents.find((d) => d.category === "tax_token") || null);
        setFitnessCertificate(
          documents.find((d) => d.category === "fitness_certificate") || null,
        );
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

  // Actually deletes the document on the backend before clearing it from
  // the slot — previously this only cleared local state, leaving the
  // "removed" document still attached to the vehicle server-side.
  const removeDocument = async (
    doc: UploadedDocument | null,
    clearLocal: () => void,
  ) => {
    if (!doc || !token) return;
    try {
      await deleteDocument(doc.id, token);
      clearLocal();
    } catch (err) {
      setError(
        formatApiError(err, "Could not remove document, please try again."),
      );
    }
  };

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
      condition: form.condition as "new" | "old",
      color: form.color || undefined,
    };

    try {
      if (savedVehicleId) {
        await updateVehicle(
          savedVehicleId,
          { ...payload, ownerDriverId: form.ownerDriverId || null },
          token,
        );
        router.push("/dashboard/vehicles");
      } else {
        const created = await createVehicle(
          {
            ...payload,
            ...(form.ownerDriverId
              ? { ownerDriverId: form.ownerDriverId }
              : {}),
          },
          token,
        );
        // Stay on this page — the document section below unlocks now that
        // a real vehicle id exists, instead of navigating anywhere.
        setSavedVehicleId(created.id);
      }
    } catch (err) {
      setError(
        formatApiError(err, "Could not save vehicle, please try again."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl space-y-4" aria-hidden="true">
        <div className="h-6 w-40 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-4 w-64 rounded-lg bg-slate-100 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-11 rounded-xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-black">
          {isEdit ? "Edit vehicle" : "Add vehicle"}
        </h1>
        <p className="text-sm text-black">
          {isEdit
            ? "Update this vehicle's details."
            : "Enter vehicle details to add it to the fleet."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <SectionCard
          icon={Car}
          title="Basic details"
          description="Identify the vehicle and how it's classified."
        >
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
                min={1980}
                max={new Date().getFullYear() + 1}
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
                min={1}
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
              <label className={labelClass}>Condition</label>
              <select
                value={form.condition}
                onChange={update("condition")}
                className={inputClass}
              >
                {VEHICLE_CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c === "new" ? "New" : "Old"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Color (optional)</label>
              <input
                value={form.color}
                onChange={update("color")}
                className={inputClass}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon={Fuel}
          title="Fuel type"
          description="Select every fuel type this vehicle supports."
        >
          <div className="flex flex-wrap gap-2">
            {FUEL_TYPES.map((f) => {
              const checked = fuelTypes.includes(f);
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFuelType(f)}
                  aria-pressed={checked}
                  className={`h-9 px-3.5 rounded-lg border text-sm font-medium capitalize transition flex items-center gap-1.5 ${
                    checked
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-slate-50 border-slate-200 text-black hover:border-blue-400"
                  }`}
                >
                  {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {f}
                </button>
              );
            })}
          </div>
        </SectionCard>

        <CollapsibleSection
          title="Driver-owned vehicle (optional)"
          defaultOpen={Boolean(form.ownerDriverId)}
        >
          <p className="text-xs text-black mb-3">
            Set this when a driver brought their own car, rather than this being
            a company fleet vehicle any admin can assign.{" "}
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

        <SectionCard
          icon={FileText}
          title="Vehicle documents"
          description={`${REQUIRED_VEHICLE_PHOTOS} photos with the number plate visible, plus registration copy, tax token, and fitness certificate.`}
        >
          {!savedVehicleId ? (
            <p className="text-sm text-black bg-slate-50 rounded-xl px-4 py-3">
              Save the vehicle details above first — uploads need a saved
              vehicle to attach to.
            </p>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-sm font-medium mb-2">
                  {isFullyDocumented ? (
                    <span className="flex items-center gap-1.5 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      Fully documented
                    </span>
                  ) : (
                    <span className="text-amber-600">
                      Documents in progress
                    </span>
                  )}
                  <span className="text-black/60 text-xs">
                    {uploadedCount}/{REQUIRED_VEHICLE_DOCS}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isFullyDocumented ? "bg-green-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-black mb-3">
                  Vehicle photos (number plate visible)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vehiclePhotos.map((photo, i) => (
                    <DocumentUpload
                      key={i}
                      label={`Photo ${i + 1}`}
                      category="vehicle_photo"
                      ownerType="vehicle"
                      ownerId={savedVehicleId}
                      value={photo}
                      onUploaded={(doc) =>
                        setVehiclePhotos((prev) =>
                          prev.map((p, idx) => (idx === i ? doc : p)),
                        )
                      }
                      onRemove={() =>
                        removeDocument(photo, () =>
                          setVehiclePhotos((prev) =>
                            prev.map((p, idx) => (idx === i ? null : p)),
                          ),
                        )
                      }
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-black mb-3">
                  Paperwork
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DocumentUpload
                    label="Registration copy"
                    category="registration_copy"
                    ownerType="vehicle"
                    ownerId={savedVehicleId}
                    value={registrationCopy}
                    onUploaded={setRegistrationCopy}
                    onRemove={() =>
                      removeDocument(registrationCopy, () =>
                        setRegistrationCopy(null),
                      )
                    }
                  />
                  <DocumentUpload
                    label="Tax token"
                    category="tax_token"
                    ownerType="vehicle"
                    ownerId={savedVehicleId}
                    value={taxToken}
                    onUploaded={setTaxToken}
                    onRemove={() =>
                      removeDocument(taxToken, () => setTaxToken(null))
                    }
                  />
                  <DocumentUpload
                    label="Fitness certificate"
                    category="fitness_certificate"
                    ownerType="vehicle"
                    ownerId={savedVehicleId}
                    value={fitnessCertificate}
                    onUploaded={setFitnessCertificate}
                    onRemove={() =>
                      removeDocument(fitnessCertificate, () =>
                        setFitnessCertificate(null),
                      )
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        {error && (
          <p role="alert" className="text-sm font-medium text-red-500">
            {error}
          </p>
        )}

        {/* Sticky action bar so Save/Cancel stay reachable on long forms,
            especially once the documents section is open on mobile. */}
        <div className="fixed bottom-0 left-0 right-0 sm:static bg-white/90 backdrop-blur sm:bg-transparent sm:backdrop-blur-0 border-t sm:border-t-0 border-slate-100 px-4 sm:px-0 py-3 sm:py-0 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition"
          >
            {submitting
              ? "Saving..."
              : savedVehicleId
                ? "Save changes"
                : "Create vehicle"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/vehicles")}
            className="h-11 px-6 rounded-xl border border-slate-200 text-sm font-medium text-black hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
