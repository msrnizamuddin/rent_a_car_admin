"use client";

import { useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Tag,
  MapPin,
  MapPinned,
  Percent,
  DollarSign,
  CalendarRange,
  Image as ImageIcon,
  Type as TypeIcon,
  AlignLeft,
  Bold,
  Italic,
  Underline,
  List,
  ImagePlus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
// import { createOffer } from "@/services/offerService";
import { formatApiError } from "@/lib/errorMessages";

const inputClass =
  "w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition";

const selectClass =
  "w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition appearance-none";

type TripType = "round_trip" | "one_way" | "discount_trip";
type DiscountType = "fixed" | "percentage";

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 mb-1.5 block">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        {children}
      </div>
    </div>
  );
}

export default function OfferForm() {
  const router = useRouter();
  const { token } = useAuth();
  const editorRef = useRef<HTMLDivElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const editorImageInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    tripType: "round_trip" as TripType,
    fromLocation: "",
    toLocation: "",
    discountType: "percentage" as DiscountType,
    discountValue: "",
    startDate: "",
    endDate: "",
  });

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const applyEditorCommand = (command: string) => {
    editorRef.current?.focus();
    document.execCommand(command);
  };

  const handleInsertImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      editorRef.current?.focus();
      document.execCommand("insertImage", false, reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError("");
    setSubmitting(true);

    try {
      const offerText = editorRef.current?.innerHTML ?? "";

      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("subtitle", form.subtitle);
      payload.append("tripType", form.tripType);
      payload.append("fromLocation", form.fromLocation);
      payload.append("toLocation", form.toLocation);
      payload.append("discountType", form.discountType);
      payload.append("discountValue", form.discountValue);
      payload.append("startDate", form.startDate);
      payload.append("endDate", form.endDate);
      payload.append("offerText", offerText);
      payload.append("isActive", String(isActive));
      if (bannerFile) payload.append("banner", bannerFile);

      // await createOffer(payload, token);

      router.push("/dashboard/offers");
    } catch (err) {
      setError(
        formatApiError(err, "Could not create offer, please try again."),
      );
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Create offer</h1>
        <p className="text-sm text-slate-500">
          Set up a new offer to run on the platform.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="space-y-4">
          {/* Title — own row */}
          <Field label="Title" icon={TypeIcon}>
            <input
              required
              value={form.title}
              onChange={update("title")}
              placeholder="Eid Special Offer"
              className={inputClass}
            />
          </Field>

          {/* Subtitle — own row */}
          <Field label="Subtitle" icon={AlignLeft}>
            <input
              value={form.subtitle}
              onChange={update("subtitle")}
              placeholder="Save on every ride this Eid"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Trip type" icon={Tag}>
              <select
                value={form.tripType}
                onChange={update("tripType")}
                className={selectClass}
              >
                <option value="round_trip">Round Trip</option>
                <option value="one_way">One Way</option>
                <option value="discount_trip">Discount Trip</option>
              </select>
            </Field>

            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                Status
              </label>
              <div className="h-12 inline-flex w-full items-center rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setIsActive(true)}
                  className={`h-full flex-1 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? "bg-green-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setIsActive(false)}
                  className={`h-full flex-1 rounded-lg text-sm font-semibold transition ${
                    !isActive
                      ? "bg-slate-500 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>

          {/* From / To — one row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="From" icon={MapPin}>
              <input
                required
                value={form.fromLocation}
                onChange={update("fromLocation")}
                placeholder="Dhaka"
                className={inputClass}
              />
            </Field>
            <Field label="To" icon={MapPinned}>
              <input
                required
                value={form.toLocation}
                onChange={update("toLocation")}
                placeholder="Chattogram"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Discount type"
              icon={form.discountType === "percentage" ? Percent : DollarSign}
            >
              <select
                value={form.discountType}
                onChange={update("discountType")}
                className={selectClass}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </Field>

            <Field
              label={
                form.discountType === "percentage"
                  ? "Discount (%)"
                  : "Discount (BDT)"
              }
              icon={form.discountType === "percentage" ? Percent : DollarSign}
            >
              <input
                required
                type="number"
                min={0}
                value={form.discountValue}
                onChange={update("discountValue")}
                placeholder={form.discountType === "percentage" ? "10" : "200"}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Offer start date" icon={CalendarRange}>
              <input
                required
                type="date"
                value={form.startDate}
                onChange={update("startDate")}
                className={inputClass}
              />
            </Field>
            <Field label="Offer end date" icon={CalendarRange}>
              <input
                required
                type="date"
                value={form.endDate}
                onChange={update("endDate")}
                min={form.startDate || undefined}
                className={inputClass}
              />
            </Field>
          </div>
        </div>

        {/* Offer banner */}
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1.5 block">
            Offer banner
          </label>
          <div
            onClick={() => bannerInputRef.current?.click()}
            className="cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition flex items-center justify-center overflow-hidden"
            style={{ height: bannerPreview ? "auto" : "9rem" }}
          >
            {bannerPreview ? (
              <img
                src={bannerPreview}
                alt="Offer banner preview"
                className="w-full max-h-56 object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-slate-400 py-8">
                <ImageIcon className="w-6 h-6" />
                <span className="text-xs font-medium">
                  Click to upload a banner image
                </span>
              </div>
            )}
          </div>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={handleBannerChange}
            className="hidden"
          />
        </div>

        {/* Offer text — rich text editor */}
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1.5 block">
            Offer text
          </label>
          <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition">
            <div className="flex items-center gap-1 px-2 py-1.5 border-b border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => applyEditorCommand("bold")}
                className="w-8 h-8 grid place-items-center rounded-lg text-slate-500 hover:bg-slate-100 transition"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => applyEditorCommand("italic")}
                className="w-8 h-8 grid place-items-center rounded-lg text-slate-500 hover:bg-slate-100 transition"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => applyEditorCommand("underline")}
                className="w-8 h-8 grid place-items-center rounded-lg text-slate-500 hover:bg-slate-100 transition"
                title="Underline"
              >
                <Underline className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => applyEditorCommand("insertUnorderedList")}
                className="w-8 h-8 grid place-items-center rounded-lg text-slate-500 hover:bg-slate-100 transition"
                title="Bullet list"
              >
                <List className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <button
                type="button"
                onClick={() => editorImageInputRef.current?.click()}
                className="w-8 h-8 grid place-items-center rounded-lg text-slate-500 hover:bg-slate-100 transition"
                title="Insert image"
              >
                <ImagePlus className="w-4 h-4" />
              </button>
              <input
                ref={editorImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleInsertImage}
                className="hidden"
              />
            </div>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="min-h-[160px] px-4 py-3 text-sm text-slate-900 outline-none [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-2"
              data-placeholder="Describe the offer details here..."
            />
          </div>
        </div>

        {error && <p className="text-sm font-medium text-red-500">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition"
          >
            {submitting ? "Saving..." : "Save offer"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/offers")}
            className="h-11 px-6 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
