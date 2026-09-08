"use client";

// src/components/shared/ImageUpload.tsx
//
// A large drop-zone-style image upload — shows the uploaded image itself
// as a preview instead of DocumentUpload's "Document uploaded" link.
// Used wherever the value is a single directly-displayed image (a banner,
// a category thumbnail) rather than a paperwork/ID document.

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { uploadDocument } from "@/services/documentService";
import { formatApiError } from "@/lib/errorMessages";

type Props = {
  value: string | null;
  category: string;
  placeholder?: string;
  onUploaded: (url: string) => void;
  onRemove?: () => void;
};

export default function ImageUpload({
  value,
  category,
  placeholder = "Click to upload an image",
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
      const doc = await uploadDocument({ file, category }, token);
      onUploaded(doc.fileUrl);
    } catch (err) {
      setError(formatApiError(err, "Upload failed, please try again."));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-full h-40 object-cover" />
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-slate-600 hover:text-red-500 transition"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <label
          className={`flex flex-col items-center justify-center gap-2 h-40 rounded-xl border-2 border-dashed text-sm transition ${
            uploading
              ? "border-slate-200 text-slate-400"
              : "border-slate-300 text-slate-400 cursor-pointer hover:border-blue-400"
          }`}
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ImagePlus className="w-5 h-5" />
          )}
          <span>{uploading ? "Uploading..." : placeholder}</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
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
