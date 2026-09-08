"use client";

// src/hooks/useUsers.ts
//
// Backs the Drivers/Customers/Managers pages — all three are the same
// GET /auth/web/users list, just filtered by role.

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { listUsers, type UserListParams } from "@/services/authService";
import type { StoredUser } from "@/lib/authStorage";

export function useUsers(params: UserListParams) {
  const { token } = useAuth();
  const [users, setUsers] = useState<StoredUser[]>([]);
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
    return listUsers(params, token)
      .then((result) => {
        setUsers(result.users || []);
        setPagination(result.pagination || null);
      })
      .catch((err) => {
        setError(err as Error);
        setUsers([]);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, paramsKey]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { users, pagination, loading, error, reload };
}
