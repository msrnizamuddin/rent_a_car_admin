"use client";

import { useParams } from "next/navigation";
import AdminUserDetail from "@/components/admin-users/AdminUserDetail";

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  return <AdminUserDetail id={params.id} />;
}
