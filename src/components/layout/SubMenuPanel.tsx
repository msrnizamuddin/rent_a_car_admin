"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import type { MenuItem } from "./menuConfig";

export default function SubMenuPanel({
  item,
  onClose,
}: {
  item: MenuItem;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const Icon = item.icon;

  return (
    <>
      {/* Backdrop — mobile only. On sm+ the panel sits inline next to the
          icon rail instead of floating over the content, so no backdrop
          is needed there. */}
      <div
        className="fixed inset-0 z-40 bg-black/40 sm:hidden"
        onClick={onClose}
      />

      <div className="fixed left-[76px] top-0 z-50 h-screen w-[calc(100vw-76px)] max-w-[300px] shadow-2xl sm:static sm:z-auto sm:h-screen sm:w-[280px] sm:max-w-none sm:shadow-none bg-white border-r border-slate-100 flex flex-col">
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
          {item.submenu && item.submenu.length > 0 ? (
            <nav className="flex flex-col gap-1">
              {item.submenu.map((sub) => {
                const active = pathname === sub.href;
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={onClose}
                    className={`flex items-center justify-between h-11 px-3 rounded-xl text-sm transition ${
                      active
                        ? "bg-blue-50 text-blue-600 font-medium"
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
          ) : (
            <p className="text-sm text-black px-3 pt-2">No submenu items.</p>
          )}
        </div>
      </div>
    </>
  );
}
