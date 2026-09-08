"use client";

import Link from "next/link";
import {
  Users,
  Car,
  UserRound,
  Shield,
  ClipboardList,
  CheckCircle2,
  Route,
  Wallet,
  Clock,
  CalendarClock,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { statusStyle as rentalRequestStatusStyle } from "@/components/bookings/BookingList";

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "blue",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  tone?: "blue" | "green" | "amber" | "red";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-100 p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${toneClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function DashboardOverview() {
  const { stats, loading, error } = useDashboardStats();

  if (loading) {
    return <p className="text-sm text-slate-400">Loading dashboard…</p>;
  }

  if (error || !stats) {
    return (
      <p className="text-sm text-red-500">
        Couldn&apos;t load dashboard stats. Please try again.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Overview</h1>
        <p className="text-sm text-slate-500">
          A live snapshot of the fleet, bookings and revenue.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Customers" value={stats.totalUsers} />
        <StatCard icon={Car} label="Vehicles" value={stats.totalVehicles} tone="green" />
        <StatCard icon={UserRound} label="Drivers" value={stats.totalDrivers} tone="amber" />
        <StatCard icon={Shield} label="Managers" value={stats.totalManagers} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={ClipboardList}
          label="Pending rental requests"
          value={stats.pendingRentalRequests}
          tone="amber"
        />
        <StatCard
          icon={CheckCircle2}
          label="Confirmed rentals"
          value={stats.confirmedRentals}
          tone="green"
        />
        <StatCard icon={Route} label="Active trips" value={stats.activeTrips} />
        <StatCard
          icon={Wallet}
          label="Total revenue"
          value={`৳${stats.totalRevenue.toLocaleString()}`}
          tone="green"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Clock} label="Today's trips" value={stats.todaysTrips} />
        <StatCard icon={CalendarClock} label="Upcoming trips" value={stats.upcomingTrips} />
        <StatCard
          icon={Car}
          label="Vehicles pending approval"
          value={stats.pendingVehicleRequests}
          tone="red"
        />
        <StatCard
          icon={UserRound}
          label="Drivers pending approval"
          value={stats.pendingDriverRequests}
          tone="red"
        />
      </div>

      {/* Recent rental requests */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Recent rental requests
          </h2>
          <Link
            href="/dashboard/bookings"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all
          </Link>
        </div>

        {stats.recentRequests.length === 0 ? (
          <p className="text-sm text-slate-400">No rental requests yet.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                  <th className="py-3 px-4">Request</th>
                  <th className="py-3 px-4">Trip type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Estimated</th>
                  <th className="py-3 px-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <Link
                        href={`/dashboard/bookings/${r.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {r.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-600">{r.tripType}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          rentalRequestStatusStyle[r.status] || "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {r.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {r.estimatedRent?.total ? `৳${r.estimatedRent.total}` : "—"}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
