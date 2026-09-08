"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, User, Phone, Mail, IdCard, MapPin, Car } from "lucide-react";

type DriverFormState = {
  name: string;
  phone: string;
  email: string;
  nid: string;
  licenseNo: string;
  licenseExpiry: string;
  address: string;
  vehicle: string;
};

const initialState: DriverFormState = {
  name: "",
  phone: "",
  email: "",
  nid: "",
  licenseNo: "",
  licenseExpiry: "",
  address: "",
  vehicle: "",
};

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
      <label className="text-xs font-medium text-slate-500 mb-1.5 block">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        {children}
      </div>
    </div>
  );
}

const inputClass =
  "w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition";

export default function DriverForm() {
  const router = useRouter();
  const [form, setForm] = useState<DriverFormState>(initialState);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update =
    (key: keyof DriverFormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // TODO: POST to /api/v1/drivers
    setTimeout(() => {
      setSubmitting(false);
      router.push("/dashboard/drivers");
    }, 1000);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Add driver</h1>
        <p className="text-sm text-slate-500">
          Enter driver details to add them to the fleet.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Photo upload */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Driver"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-7 h-7 text-slate-300" />
            )}
          </div>
          <label className="h-10 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 flex items-center gap-2 cursor-pointer hover:bg-slate-50 transition">
            <Upload className="w-4 h-4" />
            Upload photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhoto}
            />
          </label>
        </div>

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
              placeholder="01xxx-xxxxxx"
              className={inputClass}
            />
          </Field>

          <Field label="Email" icon={Mail}>
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="driver@example.com"
              className={inputClass}
            />
          </Field>

          <Field label="NID number" icon={IdCard}>
            <input
              required
              value={form.nid}
              onChange={update("nid")}
              placeholder="National ID number"
              className={inputClass}
            />
          </Field>

          <Field label="License number" icon={IdCard}>
            <input
              required
              value={form.licenseNo}
              onChange={update("licenseNo")}
              placeholder="DL-XXXXXXX"
              className={inputClass}
            />
          </Field>

          <Field label="License expiry" icon={IdCard}>
            <input
              type="date"
              required
              value={form.licenseExpiry}
              onChange={update("licenseExpiry")}
              className={inputClass}
            />
          </Field>

          <Field label="Address" icon={MapPin}>
            <input
              value={form.address}
              onChange={update("address")}
              placeholder="Present address"
              className={inputClass}
            />
          </Field>

          <Field label="Assign vehicle (optional)" icon={Car}>
            <input
              value={form.vehicle}
              onChange={update("vehicle")}
              placeholder="Ford Focus — DHA-1234"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition"
          >
            {submitting ? "Saving..." : "Save driver"}
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
    </div>
  );
}
