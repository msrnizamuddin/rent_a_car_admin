"use client";

// src/components/shared/RichTextEditor.tsx
//
// A minimal contentEditable-based rich text editor — no new dependency
// (no rich-text library in this project yet, and pulling one in for a
// single "offer text" field would be a lot of weight for what's needed
// here). document.execCommand is deprecated but still broadly supported
// for these basic formatting commands across current browsers.

import { useEffect, useRef } from "react";
import { Bold, Italic, Underline, List, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { uploadDocument } from "@/services/documentService";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

const toolbarButtonClass =
  "w-7 h-7 rounded flex items-center justify-center text-black hover:bg-slate-100 transition";

export default function RichTextEditor({ value, onChange }: Props) {
  const { token } = useAuth();
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes (e.g. loading an existing offer) into the
  // DOM without clobbering the user's cursor position while they type.
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (command: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    onChange(editorRef.current?.innerHTML || "");
  };

  const handleImageFile = async (file: File | undefined) => {
    if (!file || !token) return;

    try {
      const doc = await uploadDocument({ file, category: "offer_content_image" }, token);
      exec("insertImage", doc.fileUrl);
    } catch {
      // Best-effort — a failed inline image upload just inserts nothing.
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-slate-200 bg-slate-50">
        <button type="button" onClick={() => exec("bold")} className={toolbarButtonClass} title="Bold">
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={() => exec("italic")} className={toolbarButtonClass} title="Italic">
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => exec("underline")}
          className={toolbarButtonClass}
          title="Underline"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => exec("insertUnorderedList")}
          className={toolbarButtonClass}
          title="Bullet list"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={toolbarButtonClass}
          title="Insert image"
        >
          <ImageIcon className="w-3.5 h-3.5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImageFile(e.target.files?.[0])}
        />
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={() => onChange(editorRef.current?.innerHTML || "")}
        className="min-h-[140px] px-3.5 py-3 text-sm text-black outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-2"
        suppressContentEditableWarning
      />
    </div>
  );
}
