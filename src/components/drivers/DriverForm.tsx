"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Mail, IdCard, Lock, Calendar, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createStaff, getUserById, updateUser } from "@/services/authService";
import { formatApiError } from "@/lib/errorMessages";
import DocumentUpload from "@/components/shared/DocumentUpload";
import DriverOwnVehicle from "@/components/drivers/DriverOwnVehicle";
import DriverStatusControl from "@/components/drivers/DriverStatusControl";
import type { UploadedDocument } from "@/services/documentService";

const inputClass =
  "w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition";

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 mb-1.5 block">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        {children}
      </div>
    </div>
  );
}

type DriverFormProps = {
  // Present in edit mode — PATCHes the existing driver instead of creating one.
  driverId?: string;
};

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  password: "",
  fatherName: "",
  motherName: "",
  dateOfBirth: "",
  idType: "nid" as "nid" | "passport",
  idNumber: "",
  licenseNo: "",
};

export default function DriverForm({ driverId }: DriverFormProps) {
  const router = useRouter();
  const { token } = useAuth();
  const isEdit = Boolean(driverId);

  const [form, setForm] = useState(emptyForm);
  const [idDoc, setIdDoc] = useState<UploadedDocument | null>(null);
  const [licenseDoc, setLicenseDoc] = useState<UploadedDocument | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // The driver's real id, once it exists — either passed in (edit mode)
  // or set right after a successful create. Status control and the "own
  // vehicle" section need this, so they stay on this same page and simply
  // unlock once this is set, rather than navigating anywhere.
  const [savedDriverId, setSavedDriverId] = useState<string | null>(driverId || null);

  useEffect(() => {
    if (!driverId || !token) return;

    setLoading(true);
    getUserById(driverId, token)
      .then((user) => {
        const identification = (user.identification as Record<string, unknown>) || {};
        const drivingLicense = (user.drivingLicense as Record<string, unknown>) || {};

        setForm({
          ...emptyForm,
          name: (user.fullName as string) || "",
          phone: (user.mobileNumber as string) || "",
          email: (user.email as string) || "",
          fatherName: (user.fatherName as string) || "",
          motherName: (user.motherName as string) || "",
          dateOfBirth: user.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : "",
          idType: (identification.type as "nid" | "passport") || "nid",
          idNumber: (identification.number as string) || "",
          licenseNo: (drivingLicense.number as string) || "",
        });

        if (identification.frontImage) {
          setIdDoc({
            id: "existing-id",
            ownerType: null,
            ownerId: null,
            category: (identification.type as string) || "nid",
            status: "existing",
            fileUrl: identification.frontImage as string,
          });
        }
        if (drivingLicense.frontImage) {
          setLicenseDoc({
            id: "existing-license",
            ownerType: null,
            ownerId: null,
            category: "driving_license",
            status: "existing",
            fileUrl: drivingLicense.frontImage as string,
          });
        }
      })
      .catch((err) => setError(formatApiError(err, "Could not load driver.")))
      .finally(() => setLoading(false));
  }, [driverId, token]);

  const update =
    (key: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError("");

    if (!form.idNumber) {
      setError(form.idType === "passport" ? "Passport number is required." : "NID number is required.");
      return;
    }
    if (!idDoc) {
      setError(form.idType === "passport" ? "Passport document is required." : "NID document is required.");
      return;
    }
    if (!licenseDoc) {
      setError("Driving license document is required.");
      return;
    }

    setSubmitting(true);

    const identification = {
      type: form.idType,
      number: form.idNumber,
      frontImage: idDoc.fileUrl,
    };

    const drivingLicense = {
      number: form.licenseNo,
      frontImage: licenseDoc.fileUrl,
    };

    try {
      if (savedDriverId) {
        await updateUser(
          savedDriverId,
          {
            fullName: form.name,
            mobileNumber: form.phone,
            email: form.email || undefined,
            fatherName: form.fatherName || undefined,
            motherName: form.motherName || undefined,
            dateOfBirth: form.dateOfBirth || undefined,
            identification,
            drivingLicense,
          },
          token,
        );
        router.push("/dashboard/drivers");
      } else {
        const created = await createStaff(
          {
            role: "driver",
            fullName: form.name,
            mobileNumber: form.phone,
            email: form.email || undefined,
            password: form.password,
            fatherName: form.fatherName || undefined,
            motherName: form.motherName || undefined,
            dateOfBirth: form.dateOfBirth || undefined,
            drivingLicense,
            identification,
          },
          token,
        );
        // Stay on this page — the status and own-vehicle sections below
        // unlock now that a real driver id exists, instead of navigating.
        setSavedDriverId(created.id);
      }
    } catch (err) {
      setError(
        formatApiError(err, `Could not ${isEdit ? "update" : "add"} driver, please try again.`),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-400">Loading driver…</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">
          {isEdit ? "Edit driver" : "Add driver"}
        </h1>
        <p className="text-sm text-slate-500">
          {isEdit
            ? "Update this driver's profile details."
            : "Enter driver details to add them to the fleet."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name" icon={User}>
            <input
              required
              value={form.name}
              onChange={update("name")}
              placeholder="Rafiqul Islam"
              className={inputClass}
            />
          </Field>

          <Field label="Phone number" icon={Phone}>
            <input
              required
              value={form.phone}
              onChange={update("phone")}
              placeholder="01XXXXXXXXX"
              className={inputClass}
            />
          </Field>

          <Field label="Email (optional)" icon={Mail}>
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="driver@example.com"
              className={inputClass}
            />
          </Field>

          <Field label="Father's name (optional)" icon={Users}>
            <input
              value={form.fatherName}
              onChange={update("fatherName")}
              className={inputClass}
            />
          </Field>

          <Field label="Mother's name (optional)" icon={Users}>
            <input
              value={form.motherName}
              onChange={update("motherName")}
              className={inputClass}
            />
          </Field>

          <Field label="Date of birth (optional)" icon={Calendar}>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={update("dateOfBirth")}
              className={inputClass}
            />
          </Field>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">ID type</label>
            <select value={form.idType} onChange={update("idType")} className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition">
              <option value="nid">NID</option>
              <option value="passport">Passport</option>
            </select>
          </div>

          <Field
            label={form.idType === "passport" ? "Passport number" : "NID number"}
            icon={IdCard}
          >
            <input
              required
              value={form.idNumber}
              onChange={update("idNumber")}
              placeholder="XXXXXXXXXX"
              className={inputClass}
            />
          </Field>

          <Field label="License number" icon={IdCard}>
            <input
              required={!savedDriverId}
              value={form.licenseNo}
              onChange={update("licenseNo")}
              placeholder="DL-XXXXXXX"
              className={inputClass}
            />
          </Field>

          {!savedDriverId && (
            <Field label="Temporary password" icon={Lock}>
              <input
                required
                minLength={8}
                type="password"
                value={form.password}
                onChange={update("password")}
                placeholder="At least 8 characters"
                className={inputClass}
              />
            </Field>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Documents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DocumentUpload
              label={form.idType === "passport" ? "Passport document" : "NID document"}
              category={form.idType}
              ownerType={savedDriverId ? "user" : undefined}
              ownerId={savedDriverId || undefined}
              value={idDoc}
              onUploaded={setIdDoc}
              onRemove={() => setIdDoc(null)}
            />
            <DocumentUpload
              label="Driving license document"
              category="driving_license"
              ownerType={savedDriverId ? "user" : undefined}
              ownerId={savedDriverId || undefined}
              value={licenseDoc}
              onUploaded={setLicenseDoc}
              onRemove={() => setLicenseDoc(null)}
            />
          </div>
        </div>

        {error && <p className="text-sm font-medium text-red-500">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition"
          >
            {submitting ? "Saving..." : savedDriverId ? "Save changes" : "Save driver"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/drivers")}
            className="h-11 px-6 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>

      {savedDriverId && (
        <div className="max-w-2xl mt-6 space-y-6">
          <DriverStatusControl driverId={savedDriverId} />
          <DriverOwnVehicle driverId={savedDriverId} />
        </div>
      )}
    </div>
  );
}
