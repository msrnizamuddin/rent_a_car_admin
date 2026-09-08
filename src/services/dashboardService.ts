// src/services/dashboardService.ts

import { apiGet } from "@/lib/http";
import { ENDPOINTS } from "@/constants/api.constants";

export type DashboardStats = {
  totalUsers: number;
  totalVehicles: number;
  totalDrivers: number;
  totalManagers: number;
  pendingVehicleRequests: number;
  pendingDriverRequests: number;
  pendingRentalRequests: number;
  confirmedRentals: number;
  activeTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  totalRevenue: number;
  todaysTrips: number;
  upcomingTrips: number;
  recentRequests: Array<{
    id: string;
    customerId: string;
    tripType: string;
    status: string;
    estimatedRent: { total?: number } | null;
    createdAt: string;
  }>;
};

export function getDashboardStats(token: string) {
  return apiGet<DashboardStats>(ENDPOINTS.dashboard.stats, { token });
}
