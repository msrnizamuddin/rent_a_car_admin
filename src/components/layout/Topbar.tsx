"use client";

import { Search, Bell, ChevronDown, MapPin } from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-16 shrink-0 border-b border-slate-100 bg-white flex items-center justify-between px-6 gap-4">
      {/* Search */}
      <div className="relative w-full max-w-[320px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search vehicles, bookings..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Location */}
        <button className="hidden sm:flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition">
          <MapPin className="w-4 h-4" />
          San Francisco, US
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {/* Notifications */}
        <button className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 transition">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600" />
        </button>

        {/* Avatar */}
        <button className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            A
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
        </button>
      </div>
    </header>
  );
}
