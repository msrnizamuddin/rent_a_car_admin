// src/services/documentService.ts
//
// Uploads a file to the document module (Cloudinary-backed on the
// backend). Used for driver identification/license docs and vehicle
// photos/paperwork — see DocumentUpload component.

import { apiUpload } from "@/lib/http";
import { ENDPOINTS } from "@/constants/api.constants";

export type DocumentCategory =
  | "nid"
  | "passport"
  | "driving_license"
  | "vehicle_photo"
  | "registration_copy"
  | "tax_token"
  | "fitness_certificate";

export type UploadDocumentParams = {
  file: File;
  // Omit ownerType/ownerId for "my own document" uploads made while
  // creating a record whose id isn't known yet.
  ownerType?: "user" | "vehicle";
  ownerId?: string;
  category: DocumentCategory | string;
  expiryDate?: string;
};

export type UploadedDocument = {
  id: string;
  ownerType: string | null;
  ownerId: string | null;
  category: string;
  fileUrl: string;
  status: string;
  [key: string]: unknown;
};

export function uploadDocument(params: UploadDocumentParams, token: string) {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("category", params.category);
  if (params.ownerType) formData.append("ownerType", params.ownerType);
  if (params.ownerId) formData.append("ownerId", params.ownerId);
  if (params.expiryDate) formData.append("expiryDate", params.expiryDate);

  return apiUpload<UploadedDocument>(ENDPOINTS.document.upload, formData, { token });
}
