"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Mail, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createStaff, getUserById, updateUser, updateAccountControl } from "@/services/authService";
import { formatApiError } from "@/lib/errorMessages";
import {
  PERMISSION_MODULES,
  PERMISSION_LABELS,
  PERMISSION_DESCRIPTIONS,
  emptyPermissions,
  type PermissionsMap,
} from "@/constants/permissions.constants";

const inputClass =
  "w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-black placeholder:text-black outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition";

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
      <label className="text-xs font-medium text-black mb-1.5 block">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
        {children}
      </div>
    </div>
  );
}

type AdminUserFormProps = {
  // Present in edit mode — PATCHes the existing admin user instead of
  // creating one.
  adminUserId?: string;
};

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  password: "",
};

export default function AdminUserForm({ adminUserId }: AdminUserFormProps) {
  const router = useRouter();
  const { token } = useAuth();
  const isEdit = Boolean(adminUserId);

  const [form, setForm] = useState(emptyForm);
  const [permissions, setPermissions] = useState<PermissionsMap>(emptyPermissions());
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!adminUserId || !token) return;

    setLoading(true);
    getUserById(adminUserId, token)
      .then((user) => {
        setForm({
          ...emptyForm,
          name: (user.fullName as string) || "",
          phone: (user.mobileNumber as string) || "",
          email: (user.email as string) || "",
        });
        setPermissions({
          ...emptyPermissions(),
          ...((user.permissions as PermissionsMap) || {}),
        });
        setIsActive((user.centralStatus as string) !== "inactive");
      })
      .catch((err) => setError(formatApiError(err, "Could not load admin user.")))
      .finally(() => setLoading(false));
  }, [adminUserId, token]);

  const update =
    (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const togglePermission = (moduleKey: (typeof PERMISSION_MODULES)[number]) =>
    setPermissions((prev) => ({ ...prev, [moduleKey]: !prev[moduleKey] }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError("");

    if (!form.name.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!form.phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (!isEdit && form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);

    try {
      if (isEdit && adminUserId) {
        await updateUser(
          adminUserId,
          {
            fullName: form.name,
            mobileNumber: form.phone,
            email: form.email || undefined,
          },
          token,
        );
        await updateAccountControl(
          adminUserId,
          {
            permissions,
            ...(isActive
              ? { centralStatus: "active" }
              : { centralStatus: "inactive", reason: "Deactivated by superadmin" }),
          },
          token,
        );
      } else {
        await createStaff(
          {
            role: "manager",
            fullName: form.name,
            mobileNumber: form.phone,
            email: form.email || undefined,
            password: form.password,
            permissions,
          },
          token,
        );
      }
      router.push("/dashboard/admin-users");
    } catch (err) {
      setError(
        formatApiError(err, `Could not ${isEdit ? "update" : "add"} admin user, please try again.`),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-black">Loading admin user…</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-black">
          {isEdit ? "Edit admin user" : "Add admin user"}
        </h1>
        <p className="text-sm text-black">
          {isEdit
            ? "Update this admin user's details and module access."
            : "Create a manager account and choose which modules they can access."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name" icon={User}>
            <input
              required
              type="text"
              value={form.name}
              onChange={update("name")}
              placeholder="e.g. Rakib Hasan"
              className={inputClass}
            />
          </Field>
          <Field label="Phone number" icon={Phone}>
            <input
              required
              type="tel"
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
              placeholder="name@example.com"
              className={inputClass}
            />
          </Field>
          {!isEdit && (
            <Field label="Password" icon={Lock}>
              <input
                required
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
          <label className="text-sm font-semibold text-black mb-1 block">Module access</label>
          <p className="text-xs text-black mb-3">
            Choose exactly which parts of the admin panel this user can access. Anything left
            unchecked is off-limits — the backend rejects those actions even if attempted directly.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PERMISSION_MODULES.map((moduleKey) => (
              <label
                key={moduleKey}
                className="flex items-start gap-3 rounded-xl border border-slate-200 p-3.5 cursor-pointer hover:bg-slate-50 transition"
              >
                <input
                  type="checkbox"
                  checked={Boolean(permissions[moduleKey])}
                  onChange={() => togglePermission(moduleKey)}
                  className="mt-0.5 w-4 h-4 accent-blue-600"
                />
                <span>
                  <span className="block text-sm font-medium text-black">
                    {PERMISSION_LABELS[moduleKey]}
                  </span>
                  <span className="block text-xs text-black">
                    {PERMISSION_DESCRIPTIONS[moduleKey]}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {isEdit && (
          <div>
            <label className={"text-xs font-medium text-black mb-1.5 block"}>Status</label>
            <div className="flex gap-2 max-w-xs">
              <button
                type="button"
                onClick={() => setIsActive(true)}
                className={`flex-1 h-11 rounded-xl text-sm font-semibold transition ${
                  isActive ? "bg-green-600 text-white" : "bg-slate-100 text-black hover:bg-slate-200"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setIsActive(false)}
                className={`flex-1 h-11 rounded-xl text-sm font-semibold transition ${
                  !isActive ? "bg-slate-700 text-white" : "bg-slate-100 text-black hover:bg-slate-200"
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-sm font-medium text-red-500">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition"
          >
            {submitting ? "Saving..." : isEdit ? "Save changes" : "Create admin user"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/admin-users")}
            className="h-11 px-6 rounded-xl border border-slate-200 text-sm font-medium text-black hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
