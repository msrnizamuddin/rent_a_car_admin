"use client";

// src/components/shared/StatusBadgeSelect.tsx
//
// A <select> styled as a colored status pill instead of a plain dropdown —
// used wherever a status is both displayed as a badge and directly
// editable (driver status, account status, etc). Always pass an explicit
// text color in styleMap: unstyled text here would inherit the page's
// --foreground var, which is unreadable in dark mode against a light pill.

type Props = {
  value: string;
  options: readonly string[];
  styleMap: Record<string, string>;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function StatusBadgeSelect({ value, options, styleMap, onChange, disabled }: Props) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize border-0 outline-none cursor-pointer transition disabled:opacity-60 disabled:cursor-not-allowed ${
        styleMap[value] || "bg-slate-100 text-black"
      }`}
    >
      {options.map((o) => (
        <option key={o} value={o} className="text-black bg-white">
          {o}
        </option>
      ))}
    </select>
  );
}
