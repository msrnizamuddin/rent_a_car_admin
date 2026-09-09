"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Type, AlignLeft, Route, MapPin, Percent, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createOffer, getOfferById, updateOffer } from "@/services/offerService";
import { formatApiError } from "@/lib/errorMessages";
import ImageUpload from "@/components/shared/ImageUpload";
import RichTextEditor from "@/components/shared/RichTextEditor";
import {
  OFFER_TRIP_TYPES,
  OFFER_TRIP_TYPE_LABELS,
  DISCOUNT_TYPES,
} from "@/constants/offer.constants";

const inputClass =
  "w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-black placeholder:text-black outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition";

const labelClass = "text-xs font-medium text-black mb-1.5 block";

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
      <label className={labelClass}>{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
        {children}
      </div>
    </div>
  );
}

type OfferFormProps = {
  // Present in edit mode — PATCHes the existing offer instead of creating one.
  offerId?: string;
};

const emptyForm = {
  title: "",
  subtitle: "",
  tripType: OFFER_TRIP_TYPES[1] as string, // "round", matching the common case
  status: "active" as "active" | "inactive",
  fromLocation: "",
  toLocation: "",
  discountType: DISCOUNT_TYPES[0] as string, // "percentage"
  discountValue: "",
  startDate: "",
  endDate: "",
};

export default function OfferForm({ offerId }: OfferFormProps) {
  const router = useRouter();
  const { token } = useAuth();
  const isEdit = Boolean(offerId);

  const [form, setForm] = useState(emptyForm);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [offerText, setOfferText] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!offerId || !token) return;

    setLoading(true);
    getOfferById(offerId, token)
      .then((offer) => {
        setForm({
          title: offer.title || "",
          subtitle: offer.subtitle || "",
          tripType: offer.tripType || (OFFER_TRIP_TYPES[1] as string),
          status: offer.status || "active",
          fromLocation: offer.fromLocation || "",
          toLocation: offer.toLocation || "",
          discountType: offer.discountType || (DISCOUNT_TYPES[0] as string),
          discountValue: offer.discountValue ? String(Number(offer.discountValue)) : "",
          startDate: offer.startDate ? offer.startDate.slice(0, 10) : "",
          endDate: offer.endDate ? offer.endDate.slice(0, 10) : "",
        });
        setBannerImage(offer.bannerImage || null);
        setOfferText(offer.offerText || "");
      })
      .catch((err) => setError(formatApiError(err, "Could not load offer.")))
      .finally(() => setLoading(false));
  }, [offerId, token]);

  const update =
    (key: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError("");

    if (!form.discountValue) {
      setError("Please enter a discount value.");
      return;
    }

    setSubmitting(true);

    const payload = {
      title: form.title,
      subtitle: form.subtitle || undefined,
      tripType: form.tripType || undefined,
      status: form.status,
      fromLocation: form.fromLocation || undefined,
      toLocation: form.toLocation || undefined,
      discountType: form.discountType as "percentage" | "fixed",
      discountValue: Number(form.discountValue),
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      bannerImage: bannerImage || undefined,
      offerText: offerText || undefined,
    };

    try {
      if (isEdit && offerId) {
        await updateOffer(offerId, payload, token);
      } else {
        await createOffer(payload, token);
      }
      router.push("/dashboard/offers");
    } catch (err) {
      setError(formatApiError(err, "Could not save offer, please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-black">Loading offer…</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-black">
          {isEdit ? "Edit offer" : "Create offer"}
        </h1>
        <p className="text-sm text-black">
          {isEdit ? "Update this offer." : "Set up a new offer to run on the platform."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <Field label="Title" icon={Type}>
          <input
            required
            value={form.title}
            onChange={update("title")}
            placeholder="Eid Special Offer"
            className={inputClass}
          />
        </Field>

        <Field label="Subtitle" icon={AlignLeft}>
          <input
            value={form.subtitle}
            onChange={update("subtitle")}
            placeholder="Save on every ride this Eid"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Trip type" icon={Route}>
            <select value={form.tripType} onChange={update("tripType")} className={inputClass}>
              {OFFER_TRIP_TYPES.map((t) => (
                <option key={t} value={t}>
                  {OFFER_TRIP_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </Field>

          <div>
            <label className={labelClass}>Status</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, status: "active" }))}
                className={`flex-1 h-11 rounded-xl text-sm font-semibold transition ${
                  form.status === "active"
                    ? "bg-green-600 text-white"
                    : "bg-slate-100 text-black hover:bg-slate-200"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, status: "inactive" }))}
                className={`flex-1 h-11 rounded-xl text-sm font-semibold transition ${
                  form.status === "inactive"
                    ? "bg-slate-700 text-white"
                    : "bg-slate-100 text-black hover:bg-slate-200"
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="From (optional)" icon={MapPin}>
            <input
              value={form.fromLocation}
              onChange={update("fromLocation")}
              placeholder="Dhaka"
              className={inputClass}
            />
          </Field>
          <Field label="To (optional)" icon={MapPin}>
            <input
              value={form.toLocation}
              onChange={update("toLocation")}
              placeholder="Chattogram"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Discount type" icon={Percent}>
            <select
              value={form.discountType}
              onChange={update("discountType")}
              className={inputClass}
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </Field>
          <Field
            label={form.discountType === "fixed" ? "Discount (৳)" : "Discount (%)"}
            icon={Percent}
          >
            <input
              required
              type="number"
              min={0}
              value={form.discountValue}
              onChange={update("discountValue")}
              placeholder="10"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Offer start date (optional)" icon={Calendar}>
            <input
              type="date"
              value={form.startDate}
              onChange={update("startDate")}
              className={inputClass}
            />
          </Field>
          <Field label="Offer end date (optional)" icon={Calendar}>
            <input
              type="date"
              value={form.endDate}
              onChange={update("endDate")}
              className={inputClass}
            />
          </Field>
        </div>

        <div>
          <label className={labelClass}>Offer banner (optional)</label>
          <ImageUpload
            value={bannerImage}
            category="offer_banner"
            placeholder="Click to upload a banner image"
            onUploaded={setBannerImage}
            onRemove={() => setBannerImage(null)}
          />
        </div>

        <div>
          <label className={labelClass}>Offer text (optional)</label>
          <RichTextEditor value={offerText} onChange={setOfferText} />
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
            className="h-11 px-6 rounded-xl border border-slate-200 text-sm font-medium text-black hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
