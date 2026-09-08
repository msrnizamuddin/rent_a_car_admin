import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Car,
  CalendarCheck,
  Users,
  UserRound,
  CreditCard,
  BarChart3,
  Settings,
  LifeBuoy,
} from "lucide-react";

export type SubMenuItem = {
  label: string;
  href: string;
  count?: number;
};

export type MenuItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
  submenu?: SubMenuItem[];
};

export const menuConfig: MenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    submenu: [
      { label: "Overview", href: "/dashboard" },
      { label: "Analytics", href: "/dashboard/analytics" },
      { label: "Notifications", href: "/dashboard/notifications" },
    ],
  },
  {
    key: "vehicles",
    label: "Vehicles",
    icon: Car,
    href: "/dashboard/vehicles",
    submenu: [
      { label: "All vehicles", href: "/dashboard/vehicles", count: 96 },
      { label: "Add vehicle", href: "/dashboard/vehicles/new" },
      {
        label: "Pending approval",
        href: "/dashboard/vehicles/approval",
        count: 4,
      },
      { label: "Maintenance", href: "/dashboard/vehicles/maintenance" },
    ],
  },
  {
    key: "bookings",
    label: "Bookings",
    icon: CalendarCheck,
    href: "/dashboard/bookings",
    submenu: [
      { label: "All bookings", href: "/dashboard/bookings" },
      {
        label: "Rental requests",
        href: "/dashboard/bookings/requests",
        count: 12,
      },
      { label: "Trip management", href: "/dashboard/bookings/trips" },
      { label: "Cancellations", href: "/dashboard/bookings/cancellations" },
    ],
  },
  {
    key: "drivers",
    label: "Drivers",
    icon: UserRound,
    href: "/dashboard/drivers",
    submenu: [
      { label: "All drivers", href: "/dashboard/drivers", count: 42 },
      { label: "Add driver", href: "/dashboard/drivers/new" },
      { label: "Assignment", href: "/dashboard/drivers/assignment" },
      { label: "Documents", href: "/dashboard/drivers/documents" },
    ],
  },
  {
    key: "customers",
    label: "Customers",
    icon: Users,
    href: "/dashboard/customers",
    submenu: [
      { label: "All customers", href: "/dashboard/customers" },
      { label: "Reviews", href: "/dashboard/customers/reviews" },
      {
        label: "Support tickets",
        href: "/dashboard/customers/support",
        count: 3,
      },
    ],
  },
  {
    key: "payments",
    label: "Payments",
    icon: CreditCard,
    href: "/dashboard/payments",
    submenu: [
      { label: "Transactions", href: "/dashboard/payments" },
      { label: "Invoices", href: "/dashboard/payments/invoices" },
      { label: "Pricing rules", href: "/dashboard/payments/pricing" },
    ],
  },
  {
    key: "reports",
    label: "Reports",
    icon: BarChart3,
    href: "/dashboard/reports",
    submenu: [
      { label: "Revenue", href: "/dashboard/reports/revenue" },
      { label: "Fleet statistics", href: "/dashboard/reports/fleet" },
      { label: "Driver performance", href: "/dashboard/reports/drivers" },
    ],
  },
];

export const bottomMenuConfig: MenuItem[] = [
  {
    key: "support",
    label: "Support",
    icon: LifeBuoy,
    href: "/dashboard/help",
  },
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    submenu: [
      { label: "General", href: "/dashboard/settings" },
      { label: "Roles & permissions", href: "/dashboard/settings/roles" },
      { label: "Security & audit", href: "/dashboard/settings/security" },
    ],
  },
];
