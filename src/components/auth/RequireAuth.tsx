"use client";

// src/components/auth/RequireAuth.tsx
//
// Client-side route guard for the (dashboard) route group — this panel has
// no server session, so gating happens after the localStorage-backed
// AuthContext has hydrated (see isReady). Redirects to /login if there's
// no admin/manager session.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isReady } = useAuth();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isReady, isAuthenticated, router]);

  if (!isReady || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#EEF1F6]">
        <p className="text-sm text-black">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
