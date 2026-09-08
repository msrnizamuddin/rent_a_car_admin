"use client";

import { useState } from "react";
import { Search, ChevronUp, ChevronDown, X } from "lucide-react";

function Section({
  title,
  badge,
  children,
  defaultOpen = true,
}: {
  title: string;
  badge?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 py-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500">
          {title}
          {badge && (
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
              {badge}
            </span>
          )}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-blue-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

export default function FilterPanel({ onClose }: { onClose?: () => void }) {
  const [rentalType, setRentalType] = useState<"any" | "day" | "hour">("hour");
  const [bodyStyle, setBodyStyle] = useState<string[]>([
    "Hatchback",
    "Crossover",
  ]);
  const [transmission, setTransmission] = useState("Manual");

  const toggleBody = (v: string) =>
    setBodyStyle((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
    );

  return (
    <div className="w-[300px] h-screen bg-white border-r border-slate-100 flex flex-col">
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <h2 className="text-base font-semibold text-slate-900">Filter by</h2>
        <div className="flex items-center gap-3">
          <button className="text-xs font-medium text-slate-400 hover:text-slate-600">
            Reset all
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
          />
        </div>

        {/* Rental type */}
        <Section title="RENTAL TYPE">
          <div className="flex gap-2">
            {(
              [
                { key: "any", label: "Any" },
                { key: "day", label: "Per day" },
                { key: "hour", label: "Per hour" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setRentalType(key)}
                className={`h-9 px-4 rounded-lg text-sm font-medium transition ${
                  rentalType === key
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Section>

        {/* Available now toggle */}
        <div className="flex items-center justify-between py-4 border-b border-slate-100">
          <span className="text-xs font-semibold tracking-wide text-slate-500">
            AVAILABLE NOW ONLY
          </span>
          <Toggle />
        </div>

        {/* Price range */}
        <Section title="PRICE RANGE / HOUR">
          <PriceRangeSlider min={22} max={98.5} />
        </Section>

        {/* Car brand / model (collapsed by default, count badges) */}
        <Section title="CAR BRAND" badge={2} defaultOpen={false}>
          <div className="text-sm text-slate-500">Ford, Toyota</div>
        </Section>
        <Section title="CAR MODEL & YEAR" badge={3} defaultOpen={false}>
          <div className="text-sm text-slate-500">Focus, Kuga, Corolla</div>
        </Section>

        {/* Body style */}
        <Section title="BODY STYLE">
          <div className="grid grid-cols-2 gap-y-3">
            {[
              "Sedan",
              "Wagon",
              "Couple",
              "Sport coupe",
              "Pickup",
              "Van",
              "Hatchback",
              "Crossover",
            ].map((v) => (
              <label
                key={v}
                className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={bodyStyle.includes(v)}
                  onChange={() => toggleBody(v)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                {v}
              </label>
            ))}
          </div>
        </Section>

        {/* Transmission */}
        <Section title="TRANSMISSION">
          <div className="flex flex-col gap-3">
            {[
              { label: "Any", count: 2108 },
              { label: "Automatic", count: 1142 },
              { label: "Manual", count: 966 },
            ].map(({ label, count }) => (
              <label
                key={label}
                className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none"
              >
                <input
                  type="radio"
                  name="transmission"
                  checked={transmission === label}
                  onChange={() => setTransmission(label)}
                  className="w-4 h-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                {label}
                <span className="text-slate-400">{count}</span>
              </label>
            ))}
          </div>
        </Section>

        {/* Fuel type */}
        <Section title="FUEL TYPE">
          <div className="grid grid-cols-2 gap-y-3 pb-6">
            {["Diesel", "Electric", "Petrol", "Hybrid"].map((v) => (
              <label
                key={v}
                className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  defaultChecked={v === "Diesel"}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                {v}
              </label>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Toggle() {
  const [on, setOn] = useState(false);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      className={`w-10 h-6 rounded-full transition relative ${
        on ? "bg-blue-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${
          on ? "left-[18px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function PriceRangeSlider({ min, max }: { min: number; max: number }) {
  const [from, setFrom] = useState(min);
  const [to, setTo] = useState(max);

  return (
    <div>
      <div className="h-12 flex items-end gap-[2px] mb-3">
        {Array.from({ length: 36 }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-sm ${
              i < 26 ? "bg-blue-500" : "bg-slate-200"
            }`}
            style={{ height: `${20 + i * 1.6}%` }}
          />
        ))}
      </div>
      <div className="relative h-1 bg-slate-200 rounded-full mb-4">
        <div className="absolute inset-y-0 left-[10%] right-[10%] bg-blue-600 rounded-full" />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center px-3 text-sm">
          <span className="text-slate-400 mr-2">From</span>
          <span className="font-medium text-slate-900">${from}</span>
        </div>
        <div className="flex-1 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center px-3 text-sm">
          <span className="text-slate-400 mr-2">To</span>
          <span className="font-medium text-slate-900">${to}</span>
        </div>
      </div>
    </div>
  );
}
