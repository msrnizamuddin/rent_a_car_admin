"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Car, LogOut } from "lucide-react";
import { menuConfig, bottomMenuConfig } from "./menuConfig";
import SubMenuPanel from "./SubMenuPanel";
import { useAuth } from "@/context/AuthContext";

type MenuItem = (typeof menuConfig)[number];

type TooltipState = { label: string; top: number; left: number } | null;

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const allItems = useMemo(() => [...menuConfig, ...bottomMenuConfig], []);
  const activeItem = allItems.find((i) => i.key === openKey);

  const isActive = (item: MenuItem) =>
    pathname === item.href || pathname.startsWith(`${item.href}/`);

  const handleItemClick = (item: MenuItem) => {
    if (item.submenu) {
      setOpenKey((prev) => (prev === item.key ? null : item.key));
    } else {
      setOpenKey(null);
    }
  };

  // Show tooltip positioned relative to the hovered icon's actual screen
  // position (fixed + portal), so it's never clipped by the sidebar's
  // overflow-y-auto scroll container.
  const showTooltip = (e: React.MouseEvent<HTMLElement>, label: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      label,
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });
  };
  const hideTooltip = () => setTooltip(null);

  // ---------- Desktop nav icon (label always visible + submenu indicator) ----------
  const DesktopIcon = ({ item }: { item: MenuItem }) => {
    const Icon = item.icon;
    const active = openKey === item.key || isActive(item);

    const className = `relative w-16 h-[58px] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-200 ease-out ${
      active
        ? "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
    }`;

    const content = (
      <>
        <div className="relative">
          <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={2.2} />
          {/* Submenu indicator — small dot so it's obvious this item opens a panel */}
          {item.submenu && (
            <span
              className={`absolute -top-1 -right-1.5 w-[7px] h-[7px] rounded-full ring-2 ${
                active ? "bg-white ring-blue-500" : "bg-blue-500 ring-white"
              }`}
            />
          )}
        </div>
        <span className="text-[9.5px] font-medium leading-none text-center px-0.5 truncate max-w-[58px]">
          {item.label}
        </span>
      </>
    );

    const hoverProps = {
      onMouseEnter: (e: React.MouseEvent<HTMLElement>) =>
        showTooltip(e, item.label),
      onMouseLeave: hideTooltip,
    };

    if (!item.submenu) {
      return (
        <Link
          key={item.key}
          href={item.href}
          onClick={() => {
            setOpenKey(null);
            hideTooltip();
          }}
          className={className}
          {...hoverProps}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        key={item.key}
        onClick={() => handleItemClick(item)}
        className={className}
        {...hoverProps}
      >
        {content}
      </button>
    );
  };

  // ---------- Mobile bottom-nav icon ----------
  const MobileIcon = ({ item }: { item: MenuItem }) => {
    const Icon = item.icon;
    const active = openKey === item.key || isActive(item);

    const className = `shrink-0 snap-center relative flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[68px] transition-all duration-200`;

    const content = (
      <>
        <div
          className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 ease-out ${
            active
              ? "bg-blue-600 shadow-md shadow-blue-500/40 scale-105"
              : "scale-100"
          }`}
        >
          <Icon
            className={`w-[18px] h-[18px] transition-colors ${
              active ? "text-white" : "text-slate-400"
            }`}
            strokeWidth={2.2}
          />
        </div>
        <span
          className={`text-[10px] font-medium leading-none whitespace-nowrap transition-colors ${
            active ? "text-blue-600" : "text-slate-400"
          }`}
        >
          {item.label}
        </span>
      </>
    );

    if (!item.submenu) {
      return (
        <Link
          key={item.key}
          href={item.href}
          onClick={() => setOpenKey(null)}
          className={className}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        key={item.key}
        onClick={() => handleItemClick(item)}
        className={className}
      >
        {content}
      </button>
    );
  };

  return (
    <div className="flex h-screen">
      {/* ---------------- DESKTOP SIDEBAR ---------------- */}
      <aside className="hidden md:flex w-[92px] shrink-0 h-screen bg-white/80 backdrop-blur-xl border-r border-slate-100 flex-col items-center py-5 z-30 overflow-y-auto">
        <Link
          href="/dashboard"
          className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-7 shrink-0 shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-transform"
        >
          <Car className="w-5 h-5 text-white" strokeWidth={2.5} />
        </Link>

        <nav className="flex-1 flex flex-col items-center gap-2.5">
          {menuConfig.map((item) => (
            <DesktopIcon key={item.key} item={item} />
          ))}
        </nav>

        <div className="flex flex-col items-center gap-2.5 pt-3 shrink-0 border-t border-slate-100 w-full">
          <div className="pt-3 flex flex-col items-center gap-2.5 w-full">
            {bottomMenuConfig.map((item) => (
              <DesktopIcon key={item.key} item={item} />
            ))}
            <button
              onClick={handleLogout}
              onMouseEnter={(e) => showTooltip(e, "Log out")}
              onMouseLeave={hideTooltip}
              className="relative w-16 h-[58px] rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
            >
              <LogOut
                className="w-[18px] h-[18px] shrink-0"
                strokeWidth={2.2}
              />
              <span className="text-[9.5px] font-medium leading-none">
                Log out
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Desktop submenu panel */}
      {activeItem?.submenu && (
        <div className="hidden md:block animate-in slide-in-from-left-2 fade-in duration-200">
          <SubMenuPanel item={activeItem} onClose={() => setOpenKey(null)} />
        </div>
      )}

      {/* ---------------- MOBILE: submenu + bottom nav merged into ONE rising card ---------------- */}
      {/* Backdrop, only while a submenu is open */}
      {activeItem?.submenu && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 animate-in fade-in duration-200"
          onClick={() => setOpenKey(null)}
        />
      )}

      <div className="md:hidden fixed bottom-3 left-3 right-3 z-50 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-2xl shadow-slate-900/15 overflow-hidden safe-area-bottom animate-in fade-in duration-200">
        {/* Submenu content sits directly above the nav row, inside the same card — no gap. */}
        {activeItem?.submenu && (
          <div className="animate-in slide-in-from-bottom-3 fade-in duration-200">
            <SubMenuPanel
              item={activeItem}
              onClose={() => setOpenKey(null)}
              embedded
            />
          </div>
        )}

        {/* Nav row */}
        <div
          className={`flex items-stretch gap-2 px-4 py-2 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar scroll-px-4 ${
            activeItem?.submenu ? "border-t border-slate-100" : ""
          }`}
        >
          {menuConfig.map((item) => (
            <MobileIcon key={item.key} item={item} />
          ))}
          {bottomMenuConfig.map((item) => (
            <MobileIcon key={item.key} item={item} />
          ))}
          <button
            onClick={handleLogout}
            className="shrink-0 snap-center flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[68px]"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-full">
              <LogOut
                className="w-[18px] h-[18px] text-slate-400"
                strokeWidth={2.2}
              />
            </div>
            <span className="text-[10px] font-medium leading-none whitespace-nowrap text-slate-400">
              Log out
            </span>
          </button>
        </div>
      </div>

      {/* Global tooltip — rendered via portal so it always escapes the
          sidebar's overflow-y-auto scroll container instead of being clipped. */}
      {tooltip &&
        createPortal(
          <div
            className="fixed pointer-events-none whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-xl z-[100] animate-in fade-in duration-150"
            style={{
              top: tooltip.top,
              left: tooltip.left,
              transform: "translateY(-50%)",
            }}
          >
            {tooltip.label}
          </div>,
          document.body,
        )}
    </div>
  );
}
