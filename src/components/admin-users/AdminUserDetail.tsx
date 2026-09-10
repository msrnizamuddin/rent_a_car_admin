"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserById } from "@/services/authService";
import { formatApiError } from "@/lib/errorMessages";
import type { StoredUser } from "@/lib/authStorage";
import { centralStatusStyle } from "@/components/drivers/DriverStatusControl";
import { PERMISSION_MODULES, PERMISSION_LABELS } from "@/constants/permissions.constants";

function Badge({ value, styleMap }: { value: string; styleMap: Record<string, string> }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
        styleMap[value] || "bg-slate-100 text-black"
      }`}
    >
      {value}
    </span>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 p-5">
      <h3 className="text-sm font-semibold text-black mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-black shrink-0">{label}</dt>
      <dd className="text-black text-right">{value}</dd>
    </div>
  );
}

export default function AdminUserDetail({ id }: { id: string }) {
  const { token } = useAuth();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    getUserById(id, token)
      .then(setUser)
      .catch((err) => setError(formatApiError(err, "Could not load admin user.")))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) return <p className="text-sm text-black">Loading admin user…</p>;
  if (error || !user)
    return <p className="text-sm text-red-500">Couldn&apos;t load this admin user.</p>;

  const permissions = (user.permissions as Record<string, boolean>) || {};

  return (
    <div>
      <Link
        href="/dashboard/admin-users"
        className="inline-flex items-center gap-1.5 text-sm text-black hover:text-black mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to admin users
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-semibold shrink-0">
            {(user.fullName as string)?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-black">{user.fullName as string}</h1>
            <p className="text-sm text-black">{user.mobileNumber}</p>
          </div>
          <Badge value={(user.centralStatus as string) || "active"} styleMap={centralStatusStyle} />
        </div>

        <Link
          href={`/dashboard/admin-users/${id}/edit`}
          className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 transition"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Personal information">
          <dl className="space-y-2 text-sm">
            <Row label="Full name" value={(user.fullName as string) || "—"} />
            <Row label="Phone" value={(user.mobileNumber as string) || "—"} />
            <Row label="Email" value={(user.email as string) || "—"} />
            <Row label="Role" value={(user.role as string) || "—"} />
            {(user.centralStatus as string) === "inactive" && user.inactiveReason ? (
              <Row label="Deactivation reason" value={user.inactiveReason as string} />
            ) : null}
          </dl>
        </Card>

        <Card title="Module access">
          <dl className="space-y-2.5 text-sm">
            {PERMISSION_MODULES.map((moduleKey) => (
              <div key={moduleKey} className="flex items-center justify-between gap-4">
                <dt className="text-black">{PERMISSION_LABELS[moduleKey]}</dt>
                <dd>
                  {permissions[moduleKey] ? (
                    <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                      <Check className="w-3.5 h-3.5" /> Allowed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-black text-xs font-medium">
                      <X className="w-3.5 h-3.5" /> No access
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  );
}
