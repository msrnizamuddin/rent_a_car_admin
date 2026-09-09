"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Car, LogOut } from "lucide-react";
import { menuConfig, bottomMenuConfig } from "./menuConfig";
import SubMenuPanel from "./SubMenuPanel";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [openKey, setOpenKey] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const allItems = [...menuConfig, ...bottomMenuConfig];
  const activeItem = allItems.find((i) => i.key === openKey);

  const renderIcon = (item: (typeof allItems)[number]) => {
    const Icon = item.icon;
    const isOpen = openKey === item.key;
    const isCurrentPage = pathname === item.href || pathname.startsWith(`${item.href}/`);
    const active = isOpen || isCurrentPage;

    const className = `w-16 py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition ${
      active ? "bg-blue-50 text-blue-600" : "text-black hover:bg-slate-50"
    }`;

    const content = (
      <>
        <Icon className="w-5 h-5 shrink-0" strokeWidth={2} />
        <span className="text-[10px] font-medium leading-none text-center px-0.5">
          {item.label}
        </span>
      </>
    );

    // No submenu — the icon is a plain link straight to the page.
    if (!item.submenu) {
      return (
        <Link key={item.key} href={item.href} onClick={() => setOpenKey(null)} className={className}>
          {content}
        </Link>
      );
    }

    // Has a submenu — toggle the side panel instead of navigating directly.
    return (
      <button
        key={item.key}
        onClick={() => setOpenKey((prev) => (prev === item.key ? null : item.key))}
        className={className}
      >
        {content}
      </button>
    );
  };

  return (
    <div className="flex h-screen">
      <aside className="w-[76px] shrink-0 h-screen bg-white border-r border-slate-100 flex flex-col items-center py-4 z-30 overflow-y-auto">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center mb-6 shrink-0"
        >
          <Car className="w-5 h-5 text-white" strokeWidth={2.5} />
        </Link>

        <nav className="flex-1 flex flex-col items-center gap-1">
          {menuConfig.map(renderIcon)}
        </nav>

        <div className="flex flex-col items-center gap-1 pt-2 shrink-0">
          {bottomMenuConfig.map(renderIcon)}
          <button
            onClick={handleLogout}
            className="w-16 py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 text-black hover:text-red-500 hover:bg-red-50 transition"
          >
            <LogOut className="w-5 h-5 shrink-0" strokeWidth={2} />
            <span className="text-[10px] font-medium leading-none">Log out</span>
          </button>
        </div>
      </aside>

      {activeItem?.submenu && (
        <SubMenuPanel item={activeItem} onClose={() => setOpenKey(null)} />
      )}
    </div>
  );
}
