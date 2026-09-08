"use client";

// src/hooks/useRentalRequest.ts — single rental request, for the booking
// detail page.

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getRentalRequestById, type RentalRequest } from "@/services/rentalRequestService";

export function useRentalRequest(id: string) {
  const { token } = useAuth();
  const [rentalRequest, setRentalRequest] = useState<RentalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(() => {
    if (!token || !id) return Promise.resolve();
    setLoading(true);
    return getRentalRequestById(id, token)
      .then((data) => setRentalRequest(data))
      .catch((err) => setError(err as Error))
      .finally(() => setLoading(false));
  }, [token, id]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { rentalRequest, loading, error, reload };
}
