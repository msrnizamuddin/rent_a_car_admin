import { Suspense } from "react";
import AdminUserList from "@/components/admin-users/AdminUserList";

export default function AdminUsersPage() {
  return (
    <Suspense fallback={null}>
      <AdminUserList />
    </Suspense>
  );
}
