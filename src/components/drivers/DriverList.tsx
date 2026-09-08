"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  Pencil,
  Phone,
  Star,
} from "lucide-react";

export type Driver = {
  id: string;
  name: string;
  photo: string;
  phone: string;
  licenseNo: string;
  vehicle: string | null;
  rating: number;
  status: "active" | "inactive" | "on-trip";
};

const driversMock: Driver[] = [
  {
    id: "1",
    name: "Rafiqul Islam",
    photo: "https://i.pravatar.cc/80?img=12",
    phone: "01711-223344",
    licenseNo: "DL-2201938",
    vehicle: "Ford Focus — DHA-1234",
    rating: 4.8,
    status: "on-trip",
  },
  {
    id: "2",
    name: "Sabbir Hossain",
    photo: "https://i.pravatar.cc/80?img=33",
    phone: "01812-556677",
    licenseNo: "DL-2100472",
    vehicle: "Toyota Corolla — DHA-5566",
    rating: 4.6,
    status: "active",
  },
  {
    id: "3",
    name: "Masud Rana",
    photo: "https://i.pravatar.cc/80?img=51",
    phone: "01911-889900",
    licenseNo: "DL-1998234",
    vehicle: null,
    rating: 4.2,
    status: "inactive",
  },
];

const statusStyle: Record<Driver["status"], string> = {
  active: "bg-green-50 text-green-600",
  "on-trip": "bg-blue-50 text-blue-600",
  inactive: "bg-slate-100 text-slate-500",
};

const statusLabel: Record<Driver["status"], string> = {
  active: "Active",
  "on-trip": "On trip",
  inactive: "Inactive",
};

export default function DriverList() {
  const [drivers] = useState<Driver[]>(driversMock);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Drivers</h1>
          <p className="text-sm text-slate-500">
            {drivers.length} total drivers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search drivers"
              className="h-11 w-64 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
            />
          </div>
          <Link
            href="/dashboard/drivers/new"
            className="h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            Add driver
          </Link>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
              <th className="py-3 px-4">Driver</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">License no.</th>
              <th className="py-3 px-4">Assigned vehicle</th>
              <th className="py-3 px-4">Rating</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {drivers.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50/60 transition">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={d.photo}
                      alt={d.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <span className="font-medium text-slate-900">{d.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-600">{d.phone}</td>
                <td className="py-3 px-4 text-slate-600">{d.licenseNo}</td>
                <td className="py-3 px-4 text-slate-600">
                  {d.vehicle ?? (
                    <span className="text-slate-400">Unassigned</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className="flex items-center gap-1 text-slate-700">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {d.rating}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[d.status]}`}
                  >
                    {statusLabel[d.status]}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/dashboard/drivers/${d.id}`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/dashboard/drivers/${d.id}/edit`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {drivers.map((d) => (
          <div
            key={d.id}
            className="relative flex items-center gap-3 p-3 rounded-2xl border border-slate-100"
          >
            <img
              src={d.photo}
              alt={d.name}
              className="w-12 h-12 rounded-full object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-900 truncate">{d.name}</p>
              <p className="text-xs text-slate-500 truncate">
                {d.vehicle ?? "Unassigned"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusStyle[d.status]}`}
                >
                  {statusLabel[d.status]}
                </span>
                <span className="flex items-center gap-0.5 text-xs text-slate-500">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {d.rating}
                </span>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() =>
                  setOpenMenuId((prev) => (prev === d.id ? null : d.id))
                }
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {openMenuId === d.id && (
                <div className="absolute right-0 top-9 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10">
                  <Link
                    href={`/dashboard/drivers/${d.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </Link>
                  <Link
                    href={`/dashboard/drivers/${d.id}/edit`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <a
                    href={`tel:${d.phone}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
