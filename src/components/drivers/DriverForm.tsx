"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Mail, IdCard, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createStaff } from "@/services/authService";
import { formatApiError } from "@/lib/errorMessages";

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

export default function DriverForm() {
  const router = useRouter();
  const { token } = useAuth();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    licenseNo: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError("");
    setSubmitting(true);

    try {
      await createStaff(
        {
          role: "driver",
          fullName: form.name,
          mobileNumber: form.phone,
          email: form.email || undefined,
          password: form.password,
          drivingLicense: { number: form.licenseNo },
        },
        token,
      );

      router.push("/dashboard/drivers");
    } catch (err) {
      setError(formatApiError(err, "Could not add driver, please try again."));
      setSubmitting(false);
    }
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

          <Field label="License number" icon={IdCard}>
            <input
              required
              value={form.licenseNo}
              onChange={update("licenseNo")}
              placeholder="DL-XXXXXXX"
              className={inputClass}
            />
          </Field>

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
        </div>

        {error && <p className="text-sm font-medium text-red-500">{error}</p>}

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
