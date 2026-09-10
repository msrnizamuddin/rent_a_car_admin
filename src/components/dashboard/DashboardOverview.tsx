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
  ArrowRight,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { statusStyle as rentalRequestStatusStyle } from "@/components/bookings/BookingList";

type Tone = "blue" | "green" | "amber" | "red";

const TONE_STYLES: Record<Tone, { bg: string; text: string; ring: string }> = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    ring: "group-hover:ring-blue-100",
  },
  green: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    ring: "group-hover:ring-emerald-100",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    ring: "group-hover:ring-amber-100",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-600",
    ring: "group-hover:ring-red-100",
  },
};

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "blue",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  tone?: Tone;
}) {
  const t = TONE_STYLES[tone];

  return (
    <div
      className={`group rounded-xl sm:rounded-2xl border border-slate-100 p-2.5 sm:p-5 bg-white transition-all duration-200 hover:shadow-lg hover:shadow-slate-900/5 hover:-translate-y-0.5 ring-1 ring-transparent ${t.ring} flex items-center gap-2 sm:block sm:gap-0`}
    >
      <div
        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 sm:mb-4 ${t.bg} ${t.text}`}
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
      </div>
      <div className="min-w-0 sm:min-w-0">
        <p className="text-sm sm:text-2xl font-semibold text-slate-900 tabular-nums leading-tight">
          {value}
        </p>
        <p className="text-[10px] sm:text-sm text-slate-500 mt-0 sm:mt-0.5 leading-snug truncate sm:whitespace-normal">
          {label}
        </p>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl sm:rounded-2xl border border-slate-100 p-2.5 sm:p-5 bg-white animate-pulse flex items-center gap-2 sm:block">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-100 shrink-0 sm:mb-4" />
      <div className="flex-1 sm:flex-none">
        <div className="h-4 sm:h-6 w-10 sm:w-16 rounded bg-slate-100 mb-1.5 sm:mb-2" />
        <div className="h-2.5 sm:h-3.5 w-16 sm:w-24 rounded bg-slate-100" />
      </div>
    </div>
  );
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-2.5 sm:mb-3.5 flex items-center gap-2">
      <span className="w-1 h-3.5 sm:h-4 rounded-full bg-blue-600" />
      <h2 className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide">
        {title}
      </h2>
      {subtitle && <span className="text-xs text-slate-400">— {subtitle}</span>}
    </div>
  );
}

export default function DashboardOverview() {
  const { stats, loading, error } = useDashboardStats();

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
        Couldn&apos;t load dashboard stats. Please try again.
      </div>
    );
  }

  return (
    <div className="pb-28 md:pb-0">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-2xl font-semibold text-slate-900">
          Overview
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          A live snapshot of the fleet, bookings and revenue.
        </p>
      </div>

      {loading || !stats ? (
        <>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4 mb-5 sm:mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4 mb-5 sm:mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        </>
      ) : (
        <>
          <SectionHeading title="People & fleet" />
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4 mb-5 sm:mb-8">
            <StatCard icon={Users} label="Customers" value={stats.totalUsers} />
            <StatCard
              icon={Car}
              label="Vehicles"
              value={stats.totalVehicles}
              tone="green"
            />
            <StatCard
              icon={UserRound}
              label="Drivers"
              value={stats.totalDrivers}
              tone="amber"
            />
            <StatCard
              icon={Shield}
              label="Managers"
              value={stats.totalManagers}
            />
          </div>

          <SectionHeading title="Rentals & revenue" />
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4 mb-5 sm:mb-8">
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
            <StatCard
              icon={Route}
              label="Active trips"
              value={stats.activeTrips}
            />
            <StatCard
              icon={Wallet}
              label="Total revenue"
              value={`৳${stats.totalRevenue.toLocaleString()}`}
              tone="green"
            />
          </div>

          <SectionHeading title="Schedule & approvals" />
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
            <StatCard
              icon={Clock}
              label="Today's trips"
              value={stats.todaysTrips}
            />
            <StatCard
              icon={CalendarClock}
              label="Upcoming trips"
              value={stats.upcomingTrips}
            />
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
        </>
      )}

      {/* Recent rental requests */}
      {!loading && stats && (
        <div>
          <div className="mb-3 sm:mb-4 flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-semibold text-slate-900">
              Recent rental requests
            </h2>
            <Link
              href="/dashboard/bookings"
              className="flex items-center gap-1 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 transition"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.recentRequests.length === 0 ? (
            <div className="rounded-xl sm:rounded-2xl border border-dashed border-slate-200 py-8 sm:py-10 text-center">
              <ClipboardList className="w-7 h-7 sm:w-8 sm:h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs sm:text-sm text-slate-500">
                No rental requests yet.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop / tablet: table */}
              <div className="hidden sm:block overflow-hidden rounded-2xl border border-slate-100">
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
                      <tr
                        key={r.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <Link
                            href={`/dashboard/bookings/${r.id}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {r.id.slice(0, 8)}
                          </Link>
                        </td>
                        <td className="py-3 px-4 capitalize text-slate-700">
                          {r.tripType}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                              rentalRequestStatusStyle[r.status] ||
                              "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {r.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 tabular-nums">
                          {r.estimatedRent?.total
                            ? `৳${r.estimatedRent.total}`
                            : "—"}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: compact stacked cards instead of a squeezed table */}
              <div className="sm:hidden flex flex-col gap-2">
                {stats.recentRequests.map((r) => (
                  <Link
                    key={r.id}
                    href={`/dashboard/bookings/${r.id}`}
                    className="block rounded-xl border border-slate-100 p-3 active:bg-slate-50 transition"
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <span className="font-medium text-blue-600 text-xs">
                        {r.id.slice(0, 8)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize shrink-0 ${
                          rentalRequestStatusStyle[r.status] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {r.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="capitalize">{r.tripType}</span>
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    {r.estimatedRent?.total && (
                      <p className="text-sm font-semibold text-slate-900 mt-1.5">
                        ৳{r.estimatedRent.total}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
