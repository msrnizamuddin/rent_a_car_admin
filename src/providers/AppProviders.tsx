"use client";

// src/providers/AppProviders.tsx
//
// Single place that composes every context provider the app needs, mounted
// once in the root layout — mirrors rent_a_car/src/providers.

import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";

export default function AppProviders({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
