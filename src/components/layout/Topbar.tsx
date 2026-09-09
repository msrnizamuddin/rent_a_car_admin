"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import GlobalSearch from "./GlobalSearch";

export default function Topbar() {
  const router = useRouter();
  const { user, role, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initial = (user?.fullName || "A").trim().charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="h-16 shrink-0 border-b border-slate-100 bg-white flex items-center justify-between px-3 sm:px-6 gap-2 sm:gap-4">
      <GlobalSearch />

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Role badge */}
        <span className="hidden sm:inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-600">
          {role || "—"}
        </span>

        {/* Notifications */}
        <button className="relative w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-black hover:bg-slate-50 transition">
          <Bell className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {initial}
            </div>
            <span className="hidden text-sm font-medium text-black sm:block">
              {user?.fullName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-black hidden sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 w-48 rounded-xl border border-slate-100 bg-white py-1 shadow-lg z-20">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-sm font-semibold text-black truncate">
                  {user?.fullName}
                </p>
                <p className="text-xs text-black truncate">
                  {user?.mobileNumber || user?.email}
                </p>
              </div>
              <a
                href="/dashboard/settings"
                className="flex items-center gap-2 px-3 py-2 text-sm text-black hover:bg-slate-50"
              >
                <User className="w-3.5 h-3.5" /> Profile
              </a>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
              >
                <LogOut className="w-3.5 h-3.5" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
