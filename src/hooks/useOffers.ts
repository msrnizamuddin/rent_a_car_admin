"use client";

// src/hooks/useOffers.ts

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAllOffers, type Offer } from "@/services/offerService";

export function useOffers() {
  const { token } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    return getAllOffers(token || undefined)
      .then((data) => setOffers(data || []))
      .catch((err) => setError(err as Error))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { offers, loading, error, reload };
}
