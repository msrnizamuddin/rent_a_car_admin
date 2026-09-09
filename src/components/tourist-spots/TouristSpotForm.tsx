"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Type, AlignLeft, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  createTouristSpot,
  getTouristSpotById,
  updateTouristSpot,
} from "@/services/touristSpotService";
import { formatApiError } from "@/lib/errorMessages";
import ImageUpload from "@/components/shared/ImageUpload";

const inputClass =
  "w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-black placeholder:text-black outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition";

const textareaClass =
  "w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-black placeholder:text-black outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition resize-none";

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
        <Icon className="absolute left-3.5 top-3.5 w-4 h-4 text-black" />
        {children}
      </div>
    </div>
  );
}

type TouristSpotFormProps = {
  // Present in edit mode — PATCHes the existing spot instead of creating one.
  touristSpotId?: string;
};

const emptyForm = {
  name: "",
  description: "",
  location: "",
  status: "active" as "active" | "inactive",
};

export default function TouristSpotForm({ touristSpotId }: TouristSpotFormProps) {
  const router = useRouter();
  const { token } = useAuth();
  const isEdit = Boolean(touristSpotId);

  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!touristSpotId || !token) return;

    setLoading(true);
    getTouristSpotById(touristSpotId, token)
      .then((spot) => {
        setForm({
          name: spot.name || "",
          description: spot.description || "",
          location: spot.location || "",
          status: spot.status || "active",
        });
        setImage(spot.image || null);
      })
      .catch((err) => setError(formatApiError(err, "Could not load tourist spot.")))
      .finally(() => setLoading(false));
  }, [touristSpotId, token]);

  const update =
    (key: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError("");

    if (!form.name.trim()) {
      setError("Please enter a name.");
      return;
    }

    setSubmitting(true);

    const payload = {
      name: form.name,
      description: form.description || undefined,
      location: form.location || undefined,
      status: form.status,
      image: image || undefined,
    };

    try {
      if (isEdit && touristSpotId) {
        await updateTouristSpot(touristSpotId, payload, token);
      } else {
        await createTouristSpot(payload, token);
      }
      router.push("/dashboard/tourist-spots");
    } catch (err) {
      setError(formatApiError(err, "Could not save tourist spot, please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-black">Loading tourist spot…</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-black">
          {isEdit ? "Edit tourist spot" : "Add tourist spot"}
        </h1>
        <p className="text-sm text-black">
          {isEdit
            ? "Update this destination."
            : "Add a destination to feature on the public website."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <Field label="Name" icon={Type}>
          <input
            required
            value={form.name}
            onChange={update("name")}
            placeholder="Cox's Bazar"
            className={inputClass}
          />
        </Field>

        <Field label="Location (optional)" icon={MapPin}>
          <input
            value={form.location}
            onChange={update("location")}
            placeholder="Chattogram, Bangladesh"
            className={inputClass}
          />
        </Field>

        <Field label="Description (optional)" icon={AlignLeft}>
          <textarea
            rows={3}
            value={form.description}
            onChange={update("description")}
            placeholder="Longest natural sea beach in the world."
            className={textareaClass}
          />
        </Field>

        <div>
          <label className={labelClass}>Status</label>
          <div className="flex gap-2 max-w-xs">
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

        <div>
          <label className={labelClass}>Spot image / banner (optional)</label>
          <ImageUpload
            value={image}
            category="tourist_spot"
            placeholder="Click to upload an image"
            onUploaded={setImage}
            onRemove={() => setImage(null)}
          />
        </div>

        {error && <p className="text-sm font-medium text-red-500">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition"
          >
            {submitting ? "Saving..." : "Save tourist spot"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/tourist-spots")}
            className="h-11 px-6 rounded-xl border border-slate-200 text-sm font-medium text-black hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
