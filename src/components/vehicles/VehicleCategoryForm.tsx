"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  createVehicleCategory,
  getVehicleCategoryById,
  updateVehicleCategory,
} from "@/services/vehicleCategoryService";
import { formatApiError } from "@/lib/errorMessages";
import ImageUpload from "@/components/shared/ImageUpload";

const inputClass =
  "w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-black placeholder:text-black outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition";

const labelClass = "text-xs font-medium text-black mb-1.5 block";

type VehicleCategoryFormProps = {
  // Present in edit mode — PATCHes the existing category instead of creating one.
  categoryId?: string;
};

export default function VehicleCategoryForm({ categoryId }: VehicleCategoryFormProps) {
  const router = useRouter();
  const { token } = useAuth();
  const isEdit = Boolean(categoryId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!categoryId || !token) return;

    setLoading(true);
    getVehicleCategoryById(categoryId, token)
      .then((category) => {
        setName(category.name || "");
        setDescription(category.description || "");
        setImage(category.image || null);
        setStatus(category.status || "active");
      })
      .catch((err) => setError(formatApiError(err, "Could not load category.")))
      .finally(() => setLoading(false));
  }, [categoryId, token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError("");
    setSubmitting(true);

    const payload = {
      name,
      description: description || undefined,
      image: image || undefined,
      status,
    };

    try {
      if (isEdit && categoryId) {
        await updateVehicleCategory(categoryId, payload, token);
      } else {
        await createVehicleCategory(payload, token);
      }
      router.push("/dashboard/vehicle-categories");
    } catch (err) {
      setError(formatApiError(err, "Could not save category, please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-black">Loading category…</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-black">
          {isEdit ? "Edit category" : "Add category"}
        </h1>
        <p className="text-sm text-black">
          {isEdit
            ? "Update this vehicle category."
            : "Create a new category to group vehicles under."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label className={labelClass}>Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sedan"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`${inputClass} h-auto py-2.5 resize-none`}
          />
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStatus("active")}
              className={`flex-1 h-11 rounded-xl text-sm font-semibold transition ${
                status === "active"
                  ? "bg-green-600 text-white"
                  : "bg-slate-100 text-black hover:bg-slate-200"
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatus("inactive")}
              className={`flex-1 h-11 rounded-xl text-sm font-semibold transition ${
                status === "inactive"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-100 text-black hover:bg-slate-200"
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        <div>
          <label className={labelClass}>Image (optional)</label>
          <ImageUpload
            value={image}
            category="vehicle_category_image"
            placeholder="Click to upload a category image"
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
            {submitting ? "Saving..." : "Save category"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/vehicle-categories")}
            className="h-11 px-6 rounded-xl border border-slate-200 text-sm font-medium text-black hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
