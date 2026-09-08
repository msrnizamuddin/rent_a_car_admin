// src/services/reportService.ts

import { apiGet } from "@/lib/http";
import { ENDPOINTS } from "@/constants/api.constants";

export type UserReport = {
  totalUsers: number;
  activeUsers: number;
  newUsersLast30Days: number;
};

export type VehicleReport = {
  totalVehicles: number;
  availableVehicles: number;
  rentedVehicles: number;
  maintenanceVehicles: number;
  mostRentedVehicles: Array<{ vehicleId: string; tripCount: number }>;
};

export type DriverReport = {
  totalDrivers: number;
  activeDrivers: number;
  availableDrivers: number;
  assignedDrivers: number;
  driverEarnings: Array<{ driverId: string; completedTrips: number; totalEarnings: number }>;
};

export type TripReport = {
  totalTrips: number;
  singleTrips: number;
  roundTrips: number;
  downTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  pendingTrips: number;
};

export type FinancialReport = {
  totalRevenue: number;
  totalRefunded: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
};

export const getUserReport = (token: string) => apiGet<UserReport>(ENDPOINTS.report.users, { token });
export const getVehicleReport = (token: string) => apiGet<VehicleReport>(ENDPOINTS.report.vehicles, { token });
export const getDriverReport = (token: string) => apiGet<DriverReport>(ENDPOINTS.report.drivers, { token });
export const getTripReport = (token: string) => apiGet<TripReport>(ENDPOINTS.report.trips, { token });
export const getFinancialReport = (token: string) => apiGet<FinancialReport>(ENDPOINTS.report.financial, { token });
