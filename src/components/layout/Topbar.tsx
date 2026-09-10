"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import GlobalSearch from "./GlobalSearch";

export default function Topbar() {
  const router = useRouter();
  const { user, role, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initial = (user?.fullName || "A").trim().charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Close the dropdown when clicking anywhere outside of it.
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="h-16 shrink-0 border-b border-slate-100 bg-white/80 backdrop-blur-xl flex items-center justify-between px-3 sm:px-6 gap-2 sm:gap-4 sticky top-0 z-20">
      <GlobalSearch />

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Role badge */}
        <span className="hidden sm:inline-flex items-center rounded-full bg-gradient-to-b from-blue-50 to-blue-100/60 px-3 py-1 text-xs font-semibold capitalize text-blue-600 ring-1 ring-blue-100">
          {role || "—"}
        </span>

        {/* Notifications */}
        <button className="relative w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all duration-200">
          <Bell className="w-[19px] h-[19px]" strokeWidth={2.2} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Avatar */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={`flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-2 transition-all duration-200 ${
              menuOpen ? "bg-slate-100" : "hover:bg-slate-50"
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-semibold shrink-0 shadow-md shadow-blue-500/25">
              {initial}
            </div>
            <span className="hidden max-w-[120px] truncate text-sm font-medium text-slate-800 sm:block">
              {user?.fullName}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform duration-200 ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-[52px] w-56 rounded-2xl border border-slate-100 bg-white/95 backdrop-blur-xl py-1.5 shadow-xl shadow-slate-900/10 z-20 animate-in fade-in slide-in-from-top-2 duration-150 origin-top-right">
              <div className="flex items-center gap-3 px-3.5 py-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-semibold shrink-0 shadow-md shadow-blue-500/25">
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.mobileNumber || user?.email}
                  </p>
                </div>
              </div>

              <div className="py-1">
                <a
                  href="/dashboard/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" /> Profile
                </a>
                <a
                  href="/dashboard/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" /> Settings
                </a>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
