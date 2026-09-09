"use client";

// src/hooks/useTouristSpots.ts

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAllTouristSpots, type TouristSpot } from "@/services/touristSpotService";

export function useTouristSpots() {
  const { token } = useAuth();
  const [touristSpots, setTouristSpots] = useState<TouristSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    return getAllTouristSpots(token || undefined)
      .then((data) => setTouristSpots(data || []))
      .catch((err) => setError(err as Error))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { touristSpots, loading, error, reload };
}
