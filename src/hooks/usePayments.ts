"use client";

// src/hooks/usePayments.ts

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAllPayments, type Payment } from "@/services/paymentService";

export function usePayments() {
  const { token } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(() => {
    if (!token) return Promise.resolve();
    setLoading(true);
    return getAllPayments(token)
      .then((data) => setPayments(data || []))
      .catch((err) => setError(err as Error))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { payments, loading, error, reload };
}
