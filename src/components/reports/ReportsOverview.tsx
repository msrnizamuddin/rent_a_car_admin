"use client";

import { useReports } from "@/hooks/useReports";

function Card({ title, rows }: { title: string; rows: [string, string | number][] }) {
  return (
    <div className="rounded-2xl border border-slate-100 p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">{title}</h3>
      <dl className="space-y-2.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <dt className="text-slate-500">{label}</dt>
            <dd className="font-medium text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function ReportsOverview() {
  const { reports, loading, error } = useReports();

  if (loading) return <p className="text-sm text-slate-400">Loading reports…</p>;
  if (error || !reports)
    return <p className="text-sm text-red-500">Couldn&apos;t load reports.</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500">
          Revenue, fleet, driver and trip performance at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          title="Financial"
          rows={[
            ["Total revenue", `৳${reports.financial.totalRevenue.toLocaleString()}`],
            ["Total refunded", `৳${reports.financial.totalRefunded.toLocaleString()}`],
            ["Last 24 hours", `৳${reports.financial.dailyRevenue.toLocaleString()}`],
            ["Last 30 days", `৳${reports.financial.monthlyRevenue.toLocaleString()}`],
            ["Last 12 months", `৳${reports.financial.yearlyRevenue.toLocaleString()}`],
          ]}
        />

        <Card
          title="Fleet"
          rows={[
            ["Total vehicles", reports.vehicles.totalVehicles],
            ["Available", reports.vehicles.availableVehicles],
            ["Rented", reports.vehicles.rentedVehicles],
            ["In maintenance", reports.vehicles.maintenanceVehicles],
          ]}
        />

        <Card
          title="Drivers"
          rows={[
            ["Total drivers", reports.drivers.totalDrivers],
            ["Active", reports.drivers.activeDrivers],
            ["Available now", reports.drivers.availableDrivers],
            ["Currently assigned", reports.drivers.assignedDrivers],
          ]}
        />

        <Card
          title="Customers"
          rows={[
            ["Total customers", reports.users.totalUsers],
            ["Active", reports.users.activeUsers],
            ["New (last 30 days)", reports.users.newUsersLast30Days],
          ]}
        />

        <Card
          title="Trips"
          rows={[
            ["Total trips", reports.trips.totalTrips],
            ["Single", reports.trips.singleTrips],
            ["Round", reports.trips.roundTrips],
            ["Down", reports.trips.downTrips],
            ["Completed", reports.trips.completedTrips],
            ["Cancelled", reports.trips.cancelledTrips],
            ["Pending", reports.trips.pendingTrips],
          ]}
        />
      </div>

      {reports.vehicles.mostRentedVehicles.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">
            Most rented vehicles
          </h3>
          <ul className="space-y-2 text-sm">
            {reports.vehicles.mostRentedVehicles.map((v) => (
              <li key={v.vehicleId} className="flex items-center justify-between">
                <span className="text-slate-600">{v.vehicleId.slice(0, 8)}</span>
                <span className="font-medium text-slate-900">{v.tripCount} trips</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {reports.drivers.driverEarnings.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Driver earnings</h3>
          <ul className="space-y-2 text-sm">
            {reports.drivers.driverEarnings.map((d) => (
              <li key={d.driverId} className="flex items-center justify-between">
                <span className="text-slate-600">
                  {d.driverId.slice(0, 8)} · {d.completedTrips} trips
                </span>
                <span className="font-medium text-slate-900">
                  ৳{d.totalEarnings.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
