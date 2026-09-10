"use client";

import { useParams } from "next/navigation";
import AdminUserForm from "@/components/admin-users/AdminUserForm";

export default function EditAdminUserPage() {
  const params = useParams<{ id: string }>();
  return <AdminUserForm adminUserId={params.id} />;
}
