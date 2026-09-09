"use client";

// src/components/shared/DocumentUpload.tsx
//
// File picker + preview + "uploading..." state for one document slot.
// Uploads immediately on selection via documentService, then hands the
// created Document record back to the parent through onUploaded — the
// parent decides where the resulting fileUrl goes (identification.frontImage,
// a vehicle_photo slot, etc).

import { useRef, useState } from "react";
import { UploadCloud, CheckCircle2, X, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { uploadDocument, type DocumentCategory, type UploadedDocument } from "@/services/documentService";
import { formatApiError } from "@/lib/errorMessages";

type Props = {
  label: string;
  category: DocumentCategory | string;
  ownerType?: "user" | "vehicle";
  ownerId?: string;
  value?: UploadedDocument | null;
  onUploaded: (doc: UploadedDocument) => void;
  onRemove?: () => void;
};

export default function DocumentUpload({
  label,
  category,
  ownerType,
  ownerId,
  value,
  onUploaded,
  onRemove,
}: Props) {
  const { token } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File | undefined) => {
    if (!file || !token) return;

    setError("");
    setUploading(true);

    try {
      const doc = await uploadDocument({ file, category, ownerType, ownerId }, token);
      onUploaded(doc);
    } catch (err) {
      setError(formatApiError(err, "Upload failed, please try again."));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="text-xs font-medium text-black mb-1.5 block">{label}</label>

      {value ? (
        <div className="flex items-center gap-3 h-11 px-3.5 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <a
            href={value.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="truncate flex-1 underline underline-offset-2"
          >
            Document uploaded
          </a>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="shrink-0 text-green-700/70 hover:text-green-900"
              aria-label="Remove uploaded document"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <label
          className={`flex items-center gap-3 h-11 px-3.5 rounded-xl bg-slate-50 border border-dashed text-sm transition ${
            uploading
              ? "border-slate-200 text-black"
              : "border-slate-300 text-black cursor-pointer hover:border-blue-400"
          }`}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
          ) : (
            <UploadCloud className="w-4 h-4 shrink-0" />
          )}
          <span>{uploading ? "Uploading..." : "Choose file"}</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
      )}

      {error && <p className="text-xs font-medium text-red-500 mt-1">{error}</p>}
    </div>
  );
}
