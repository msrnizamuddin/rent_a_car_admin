"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, LogOut } from "lucide-react";
import { menuConfig, bottomMenuConfig } from "./menuConfig";
import SubMenuPanel from "./SubMenuPanel";

export default function Sidebar() {
  const pathname = usePathname();
  const [openKey, setOpenKey] = useState<string | null>("vehicles");

  const allItems = [...menuConfig, ...bottomMenuConfig];
  const activeItem = allItems.find((i) => i.key === openKey);

  const renderIcon = (item: (typeof allItems)[number]) => {
    const Icon = item.icon;
    const isOpen = openKey === item.key;
    const isCurrentPage = !item.submenu && pathname === item.href;
    const active = isOpen || isCurrentPage;

    return (
      <button
        key={item.key}
        title={item.label}
        onClick={() => {
          if (item.submenu) {
            setOpenKey((prev) => (prev === item.key ? null : item.key));
          } else {
            setOpenKey(null);
          }
        }}
        className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition ${
          active
            ? "bg-blue-50 text-blue-600"
            : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
        }`}
      >
        {active && (
          <span className="absolute -left-5 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-blue-600" />
        )}
        <Icon className="w-5 h-5" strokeWidth={2} />
      </button>
    );
  };

  return (
    <div className="flex h-screen">
      <aside className="w-[72px] shrink-0 h-screen bg-white border-r border-slate-100 flex flex-col items-center py-5 z-10">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center mb-8"
        >
          <Car className="w-5 h-5 text-white" strokeWidth={2.5} />
        </Link>

        <nav className="flex-1 flex flex-col items-center gap-2">
          {menuConfig.map(renderIcon)}
        </nav>

        <div className="flex flex-col items-center gap-2 pt-2">
          {bottomMenuConfig.map(renderIcon)}
          <button
            title="Log out"
            className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
          >
            <LogOut className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </aside>

      {activeItem?.submenu && (
        <SubMenuPanel item={activeItem} onClose={() => setOpenKey(null)} />
      )}
    </div>
  );
}
