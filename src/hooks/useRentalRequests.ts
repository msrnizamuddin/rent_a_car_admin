"use client";

// src/hooks/useRentalRequests.ts

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  listRentalRequests,
  type RentalRequest,
  type RentalRequestListParams,
} from "@/services/rentalRequestService";

export function useRentalRequests(params: RentalRequestListParams) {
  const { token } = useAuth();
  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>([]);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const paramsKey = JSON.stringify(params);

  const reload = useCallback(() => {
    if (!token) return Promise.resolve();
    setLoading(true);
    return listRentalRequests(params, token)
      .then((result) => {
        setRentalRequests(result.rentalRequests || []);
        setPagination(result.pagination || null);
      })
      .catch((err) => {
        setError(err as Error);
        setRentalRequests([]);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, paramsKey]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { rentalRequests, pagination, loading, error, reload };
}
