"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserById } from "@/services/authService";
import { getAllVehicles, type Vehicle } from "@/services/vehicleService";
import { formatApiError } from "@/lib/errorMessages";
import type { StoredUser } from "@/lib/authStorage";
import { driverStatusStyle, centralStatusStyle } from "@/components/drivers/DriverStatusControl";

function Badge({ value, styleMap }: { value: string; styleMap: Record<string, string> }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
        styleMap[value] || "bg-slate-100 text-slate-500"
      }`}
    >
      {value}
    </span>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500 shrink-0">{label}</dt>
      <dd className="text-slate-800 text-right">{value}</dd>
    </div>
  );
}

export default function DriverDetail({ id }: { id: string }) {
  const { token } = useAuth();
  const [driver, setDriver] = useState<StoredUser | null>(null);
  const [ownedVehicle, setOwnedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    Promise.all([getUserById(id, token), getAllVehicles(token)])
      .then(([user, vehicles]) => {
        setDriver(user);
        setOwnedVehicle(vehicles.find((v) => v.ownerDriverId === id) || null);
      })
      .catch((err) => setError(formatApiError(err, "Could not load driver.")))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) return <p className="text-sm text-slate-400">Loading driver…</p>;
  if (error || !driver) return <p className="text-sm text-red-500">Couldn&apos;t load this driver.</p>;

  const identification = (driver.identification as Record<string, unknown>) || {};
  const drivingLicense = (driver.drivingLicense as Record<string, unknown>) || {};
  const address = (driver.address as Record<string, unknown>) || {};

  return (
    <div>
      <Link
        href="/dashboard/drivers"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to drivers
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-semibold shrink-0">
            {(driver.fullName as string)?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{driver.fullName as string}</h1>
            <p className="text-sm text-slate-500">{driver.mobileNumber}</p>
          </div>
          <Badge value={(driver.driverStatus as string) || "pending"} styleMap={driverStatusStyle} />
          <Badge value={(driver.centralStatus as string) || "active"} styleMap={centralStatusStyle} />
        </div>

        <Link
          href={`/dashboard/drivers/${id}/edit`}
          className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 transition"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Personal information">
          <dl className="space-y-2 text-sm">
            <Row label="Full name" value={(driver.fullName as string) || "—"} />
            <Row label="Father's name" value={(driver.fatherName as string) || "—"} />
            <Row label="Mother's name" value={(driver.motherName as string) || "—"} />
            <Row
              label="Date of birth"
              value={driver.dateOfBirth ? String(driver.dateOfBirth).slice(0, 10) : "—"}
            />
            <Row label="Phone" value={(driver.mobileNumber as string) || "—"} />
            <Row label="Email" value={(driver.email as string) || "—"} />
            {Boolean(address.presentAddress || address.city) && (
              <Row
                label="Address"
                value={
                  [address.presentAddress, address.city, address.district]
                    .filter(Boolean)
                    .join(", ") || "—"
                }
              />
            )}
          </dl>
        </Card>

        <Card title="Identification">
          <dl className="space-y-2 text-sm">
            <Row label="Type" value={(identification.type as string) || "—"} />
            <Row label="Number" value={(identification.number as string) || "—"} />
            <Row
              label="Document"
              value={
                identification.frontImage ? (
                  <a
                    href={identification.frontImage as string}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </a>
                ) : (
                  "—"
                )
              }
            />
          </dl>
        </Card>

        <Card title="Driving license">
          <dl className="space-y-2 text-sm">
            <Row label="Number" value={(drivingLicense.number as string) || "—"} />
            <Row
              label="Document"
              value={
                drivingLicense.frontImage ? (
                  <a
                    href={drivingLicense.frontImage as string}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </a>
                ) : (
                  "—"
                )
              }
            />
          </dl>
        </Card>

        <Card title="Verification">
          <dl className="space-y-2 text-sm">
            <Row
              label="Verified"
              value={
                <span className={driver.isVerified ? "text-green-600" : "text-amber-600"}>
                  {driver.isVerified ? "Yes" : "No — needs approval"}
                </span>
              }
            />
            <Row
              label="Profile submitted"
              value={driver.profileSubmittedAt ? String(driver.profileSubmittedAt).slice(0, 10) : "Not yet"}
            />
            {(driver.centralStatus as string) === "inactive" && driver.inactiveReason ? (
              <Row label="Deactivation reason" value={driver.inactiveReason as string} />
            ) : null}
          </dl>
        </Card>

        <Card title="Own vehicle">
          {ownedVehicle ? (
            <dl className="space-y-2 text-sm">
              <Row label="Vehicle" value={`${ownedVehicle.brand} ${ownedVehicle.vehicleName}`} />
              <Row label="Registration" value={ownedVehicle.registrationNumber} />
              <Row
                label="Currently assigned"
                value={ownedVehicle.assignedDriverId === id ? "This driver" : "—"}
              />
              <Row
                label="Manage"
                value={
                  <Link
                    href={`/dashboard/vehicles/${ownedVehicle.id}/edit`}
                    className="text-blue-600 hover:underline"
                  >
                    View vehicle
                  </Link>
                }
              />
            </dl>
          ) : (
            <p className="text-sm text-slate-400">
              This driver doesn&apos;t have a registered vehicle of their own.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
