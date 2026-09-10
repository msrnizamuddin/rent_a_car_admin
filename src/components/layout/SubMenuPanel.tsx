"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import type { MenuItem } from "./menuConfig";

function SubmenuList({
  item,
  onClose,
  dense = false,
}: {
  item: MenuItem;
  onClose?: () => void;
  dense?: boolean;
}) {
  const pathname = usePathname();

  if (!item.submenu || item.submenu.length === 0) {
    return <p className="text-sm text-black px-4 pt-2">No submenu items.</p>;
  }

  return (
    <nav className="flex flex-col gap-1">
      {item.submenu.map((sub) => {
        const active = pathname === sub.href;
        return (
          <Link
            key={sub.href}
            href={sub.href}
            onClick={onClose}
            className={`flex items-center justify-between rounded-2xl text-sm transition ${
              dense ? "h-12 px-4" : "h-11 px-3 rounded-xl"
            } ${
              active
                ? "bg-blue-50 text-blue-600 font-medium"
                : dense
                  ? "text-black active:bg-slate-50"
                  : "text-black hover:bg-slate-50"
            }`}
          >
            {sub.label}
            {typeof sub.count === "number" && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  active ? "bg-blue-600 text-white" : "bg-slate-100 text-black"
                }`}
              >
                {sub.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default function SubMenuPanel({
  item,
  onClose,
  mobile = false,
  embedded = false,
}: {
  item: MenuItem;
  onClose?: () => void;
  /** Render as a standalone mobile bottom sheet (floating, own backdrop). */
  mobile?: boolean;
  /**
   * Render just the inner content (drag handle + header + list), no fixed
   * positioning, no backdrop, no own rounded card. Use this when the parent
   * (e.g. the mobile bottom nav container) wants to merge the submenu and
   * the nav row into a single seamless card that rises together from the
   * bottom of the screen.
   */
  embedded?: boolean;
}) {
  const Icon = item.icon;

  // ---------------- MOBILE EMBEDDED: content only, parent supplies the card/backdrop ----------------
  if (embedded) {
    return (
      <div className="flex flex-col max-h-[50vh]">
        {/* Drag handle */}
        <div className="flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-9 h-1 rounded-full bg-slate-200" />
        </div>

        <div className="flex items-center justify-between px-5 pt-1 pb-2.5 shrink-0">
          <h2 className="flex items-center gap-2 text-base font-semibold text-black">
            <Icon className="w-4 h-4 text-blue-600" />
            {item.label}
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-red-500 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-2 border-t border-slate-100 pt-2">
          <SubmenuList item={item} onClose={onClose} dense />
        </div>
      </div>
    );
  }

  // ---------------- MOBILE: standalone floating bottom sheet ----------------
  if (mobile) {
    return (
      <>
        <div
          className="fixed inset-0 z-40 bg-black/40 animate-in fade-in duration-200"
          onClick={onClose}
        />

        <div className="fixed inset-x-3 bottom-[88px] z-50 max-h-[65vh] rounded-3xl bg-white shadow-2xl shadow-slate-900/20 border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 fade-in duration-250">
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-9 h-1 rounded-full bg-slate-200" />
          </div>

          <div className="flex items-center justify-between px-5 pt-1 pb-3 shrink-0">
            <h2 className="flex items-center gap-2 text-base font-semibold text-black">
              <Icon className="w-4 h-4 text-blue-600" />
              {item.label}
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-red-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-[calc(env(safe-area-inset-bottom)+16px)]">
            <SubmenuList item={item} onClose={onClose} dense />
          </div>
        </div>
      </>
    );
  }

  // ---------------- DESKTOP / TABLET: side panel ----------------
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 sm:hidden"
        onClick={onClose}
      />

      <div className="fixed left-[92px] top-0 z-50 h-screen w-[calc(100vw-92px)] max-w-[300px] shadow-2xl sm:static sm:z-auto sm:h-screen sm:w-[280px] sm:max-w-none sm:shadow-none bg-white border-r border-slate-100 flex flex-col">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-black">
            <Icon className="w-4 h-4 text-blue-600" />
            {item.label}
          </h2>
          {onClose && (
            <button onClick={onClose} className="text-black hover:text-red-500">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <SubmenuList item={item} onClose={onClose} />
        </div>
      </div>
    </>
  );
}
