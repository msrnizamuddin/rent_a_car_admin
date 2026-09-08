// src/lib/errorMessages.ts
//
// Turns the backend's Joi field errors (raw, developer-facing) into short
// messages a user can actually act on. The backend only ever sends
// { field, message } pairs — no error "type" — so we pattern-match on the
// Joi message text to pick a friendly phrasing.

import type { ApiError, FieldError } from "./http";

const FIELD_LABELS: Record<string, string> = {
  mobileNumber: "Phone number",
  fullName: "Full name",
  email: "Email",
  password: "Password",
  confirmPassword: "Confirm password",
};

function friendlyFieldMessage(field: string, rawMessage = ""): string {
  const label = FIELD_LABELS[field] || field;

  if (/is required|is not allowed to be empty/i.test(rawMessage)) {
    return `${label} is required.`;
  }

  if (field === "mobileNumber" && /(pattern|length)/i.test(rawMessage)) {
    return "Enter a valid 11-digit phone number starting with 01 (e.g. 017XXXXXXXX).";
  }

  if (field === "password" && /length must be at least/i.test(rawMessage)) {
    return "Password must be at least 8 characters long.";
  }

  if (field === "confirmPassword") {
    return "Passwords do not match.";
  }

  if (field === "email" && /valid/i.test(rawMessage)) {
    return "Enter a valid email address.";
  }

  return `${label}: ${rawMessage}`;
}

export function formatApiError(
  err: unknown,
  fallback = "Something went wrong, please try again.",
): string {
  const apiErr = err as Partial<ApiError> & { fieldErrors?: FieldError[] };

  if (apiErr?.fieldErrors?.length) {
    return apiErr.fieldErrors
      .map((fe) => friendlyFieldMessage(fe.field, fe.message))
      .join(" ");
  }

  return apiErr?.message || fallback;
}
