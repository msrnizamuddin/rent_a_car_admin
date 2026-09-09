"use client";

// src/hooks/usePricing.ts

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAllPricing, type PricingRule } from "@/services/pricingService";

export function usePricing() {
  const { token } = useAuth();
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    return getAllPricing(token || undefined)
      .then((data) => setRules(data || []))
      .catch((err) => setError(err as Error))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { rules, loading, error, reload };
}
