// src/lib/http.ts
//
// Thin fetch wrapper for the test_rent backend. Every backend response is
// shaped like { success, message, data } (or { success:false, message,
// errors }) — see v1/middleware/error.handler.middleware.js and every
// controller's handle() wrapper in the API repo. This unwraps that
// envelope so callers just get `data` back, and throws ApiError otherwise.

import { API_BASE_URL } from "@/constants/api.constants";

export type FieldError = { field: string; message: string };

export class ApiError extends Error {
  status: number;
  fieldErrors: FieldError[] | null;

  constructor(message: string, status: number, fieldErrors?: FieldError[] | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors || null;
  }
}

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

function buildUrl(path: string, params?: QueryParams) {
  const url = new URL(`${API_BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

export type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
  params?: QueryParams;
  signal?: AbortSignal;
};

export async function apiRequest<T = unknown>(
  path: string,
  { method = "GET", body, token, params, signal }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch {
    throw new ApiError(
      "Could not reach the server. Check your connection and try again.",
      0,
    );
  }

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok || payload.success === false) {
    const fieldErrors = Array.isArray(payload.errors) ? payload.errors : null;
    throw new ApiError(
      payload.message || "Something went wrong, please try again.",
      response.status,
      fieldErrors,
    );
  }

  return payload.data as T;
}

export const apiGet = <T = unknown>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
  apiRequest<T>(path, { ...options, method: "GET" });

export const apiPost = <T = unknown>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
  apiRequest<T>(path, { ...options, method: "POST", body });

export const apiPatch = <T = unknown>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
  apiRequest<T>(path, { ...options, method: "PATCH", body });

export const apiDelete = <T = unknown>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
  apiRequest<T>(path, { ...options, method: "DELETE" });

// Separate from apiRequest because multipart bodies must NOT get a
// Content-Type header set manually — the browser needs to add its own
// boundary — and must not be JSON.stringify'd.
export async function apiUpload<T = unknown>(
  path: string,
  formData: FormData,
  { token, signal }: { token?: string | null; signal?: AbortSignal } = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      method: "POST",
      headers,
      body: formData,
      signal,
    });
  } catch {
    throw new ApiError(
      "Could not reach the server. Check your connection and try again.",
      0,
    );
  }

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok || payload.success === false) {
    const fieldErrors = Array.isArray(payload.errors) ? payload.errors : null;
    throw new ApiError(
      payload.message || "Something went wrong, please try again.",
      response.status,
      fieldErrors,
    );
  }

  return payload.data as T;
}
