"use client";

// src/components/layout/GlobalSearch.tsx
//
// The Topbar's search box. Vehicles are matched the same way VehicleList
// does it: the backend's vehicle *search* endpoint only returns publicly
// bookable statuses (see vehicle.model.js's PUBLICLY_VISIBLE_STATUSES),
// which would hide a freshly-added "pending" vehicle from an admin — so
// this fetches the full "get everything" list once (lazily, on first
// focus) and filters it client-side, exactly like useVehicles.ts.
// Drivers/customers, on the other hand, use the real backend text search
// (name/phone/email) once per role so results can be grouped and routed
// correctly. Bookings have no server-side text search yet, so they're
// intentionally left out rather than promising a search that doesn't
// really work.

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, Car, UserRound, Users, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getAllVehicles, type Vehicle } from "@/services/vehicleService";
import { listUsers } from "@/services/authService";
import type { StoredUser } from "@/lib/authStorage";

type PeopleResults = {
  drivers: StoredUser[];
  driverTotal: number;
  customers: StoredUser[];
  customerTotal: number;
};

const EMPTY_PEOPLE: PeopleResults = {
  drivers: [],
  driverTotal: 0,
  customers: [],
  customerTotal: 0,
};

export default function GlobalSearch() {
  const router = useRouter();
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [people, setPeople] = useState<PeopleResults>(EMPTY_PEOPLE);
  const [allVehicles, setAllVehicles] = useState<Vehicle[] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();

  const ensureVehiclesLoaded = () => {
    if (allVehicles !== null || !token) return;
    getAllVehicles(token)
      .then((data) => setAllVehicles(data || []))
      .catch(() => setAllVehicles([]));
  };

  const vehicleMatches = useMemo(() => {
    if (!allVehicles || trimmed.length < 2) return [];
    const q = trimmed.toLowerCase();
    return allVehicles.filter((v) =>
      `${v.brand} ${v.vehicleName} ${v.registrationNumber}`
        .toLowerCase()
        .includes(q),
    );
  }, [allVehicles, trimmed]);

  // Debounced people search — fires 300ms after the user stops typing.
  useEffect(() => {
    if (!token || trimmed.length < 2) {
      setPeople(EMPTY_PEOPLE);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      Promise.allSettled([
        listUsers({ role: "driver", search: trimmed, limit: 5 }, token),
        listUsers({ role: "customer", search: trimmed, limit: 5 }, token),
      ]).then(([driverRes, customerRes]) => {
        setPeople({
          drivers:
            driverRes.status === "fulfilled" ? driverRes.value.users || [] : [],
          driverTotal:
            driverRes.status === "fulfilled"
              ? (driverRes.value.pagination?.total ?? 0)
              : 0,
          customers:
            customerRes.status === "fulfilled"
              ? customerRes.value.users || []
              : [],
          customerTotal:
            customerRes.status === "fulfilled"
              ? (customerRes.value.pagination?.total ?? 0)
              : 0,
        });
        setLoading(false);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [trimmed, token]);

  // Close on outside click / Escape.
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const goToList = (path: string) => {
    router.push(`${path}?q=${encodeURIComponent(trimmed)}`);
    setOpen(false);
  };

  const hasQuery = trimmed.length >= 2;
  const hasResults =
    vehicleMatches.length > 0 ||
    people.drivers.length > 0 ||
    people.customers.length > 0;
  const showDropdown = open && hasQuery;

  return (
    <div ref={containerRef} className="relative w-full max-w-[320px]">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={query}
        onFocus={() => {
          setOpen(true);
          ensureVehiclesLoaded();
        }}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && hasQuery) goToList("/dashboard/vehicles");
        }}
        placeholder="Search vehicles, drivers, customers…"
        className="w-full h-10 pl-10 pr-9 rounded-xl bg-slate-50 border border-slate-200 text-sm text-black placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-red-500"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {showDropdown && (
        <div className="absolute left-0 right-0 sm:w-[380px] top-full mt-2 rounded-2xl bg-white border border-slate-100 shadow-xl z-50 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center gap-2 px-4 py-6 text-sm text-black">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching…
            </div>
          ) : !hasResults ? (
            <p className="px-4 py-6 text-sm text-black">
              No results for &ldquo;{trimmed}&rdquo;.
            </p>
          ) : (
            <div className="py-2">
              {vehicleMatches.length > 0 && (
                <ResultGroup
                  icon={Car}
                  label="Vehicles"
                  total={vehicleMatches.length}
                  onViewAll={() => goToList("/dashboard/vehicles")}
                >
                  {vehicleMatches.slice(0, 5).map((v) => (
                    <ResultRow
                      key={v.id}
                      href={`/dashboard/vehicles/${v.id}/edit`}
                      title={`${v.brand} ${v.vehicleName}`}
                      subtitle={v.registrationNumber}
                      onClick={() => setOpen(false)}
                    />
                  ))}
                </ResultGroup>
              )}

              {people.drivers.length > 0 && (
                <ResultGroup
                  icon={UserRound}
                  label="Drivers"
                  total={people.driverTotal}
                  onViewAll={() => goToList("/dashboard/drivers")}
                >
                  {people.drivers.map((d) => (
                    <ResultRow
                      key={d.id}
                      href={`/dashboard/drivers/${d.id}`}
                      title={d.fullName || "—"}
                      subtitle={d.mobileNumber}
                      onClick={() => setOpen(false)}
                    />
                  ))}
                </ResultGroup>
              )}

              {people.customers.length > 0 && (
                <ResultGroup
                  icon={Users}
                  label="Customers"
                  total={people.customerTotal}
                  onViewAll={() => goToList("/dashboard/customers")}
                >
                  {people.customers.map((c) => (
                    <ResultRow
                      key={c.id}
                      href={`/dashboard/customers?q=${encodeURIComponent(c.fullName || c.mobileNumber || "")}`}
                      title={c.fullName || "—"}
                      subtitle={c.mobileNumber}
                      onClick={() => setOpen(false)}
                    />
                  ))}
                </ResultGroup>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultGroup({
  icon: Icon,
  label,
  total,
  onViewAll,
  children,
}: {
  icon: React.ElementType;
  label: string;
  total: number;
  onViewAll: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="px-2 pb-2">
      <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-black">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="flex flex-col">{children}</div>
      {total > 5 && (
        <button
          type="button"
          onClick={onViewAll}
          className="w-full text-left px-2 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          View all {total} in {label} →
        </button>
      )}
    </div>
  );
}

function ResultRow({
  href,
  title,
  subtitle,
  onClick,
}: {
  href: string;
  title: string;
  subtitle?: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex flex-col px-2 py-2 rounded-xl text-sm hover:bg-slate-50 transition"
    >
      <span className="font-medium text-black truncate">{title}</span>
      {subtitle && (
        <span className="text-xs text-black truncate">{subtitle}</span>
      )}
    </Link>
  );
}
