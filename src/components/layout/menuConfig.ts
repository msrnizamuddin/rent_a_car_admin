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
  Globe,
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

// Every href below routes to a real, backend-wired page — no dead links.
export const menuConfig: MenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    key: "vehicles",
    label: "Vehicles",
    icon: Car,
    href: "/dashboard/vehicles",
    submenu: [
      { label: "All vehicles", href: "/dashboard/vehicles" },
      { label: "Add vehicle", href: "/dashboard/vehicles/new" },
      { label: "Categories", href: "/dashboard/vehicle-categories" },
      { label: "Add category", href: "/dashboard/vehicle-categories/new" },
    ],
  },
  {
    key: "bookings",
    label: "Bookings",
    icon: CalendarCheck,
    href: "/dashboard/bookings",
  },
  {
    key: "drivers",
    label: "Drivers",
    icon: UserRound,
    href: "/dashboard/drivers",
    submenu: [
      { label: "All drivers", href: "/dashboard/drivers" },
      { label: "Add driver", href: "/dashboard/drivers/new" },
    ],
  },
  {
    key: "customers",
    label: "Customers",
    icon: Users,
    href: "/dashboard/customers",
  },
  {
    key: "payments",
    label: "Payments",
    icon: CreditCard,
    href: "/dashboard/payments",
  },

  {
    key: "reports",
    label: "Reports",
    icon: BarChart3,
    href: "/dashboard/reports",
  },
  {
    key: "website",
    label: "Website",
    icon: Globe,
    href: "/dashboard/offers",
    submenu: [
      { label: "Offers", href: "/dashboard/offers" },
      { label: "Add offer", href: "/dashboard/offers/new" },
      { label: "Tourist Spots", href: "/dashboard/tourist-spots" },
      { label: "Add tourist spot", href: "/dashboard/tourist-spots/new" },
    ],
  },
];

export const bottomMenuConfig: MenuItem[] = [
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
];
