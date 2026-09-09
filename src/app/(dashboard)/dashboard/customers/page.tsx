import { Suspense } from "react";
import CustomerList from "@/components/customers/CustomerList";

export default function CustomersPage() {
  return (
    <Suspense fallback={null}>
      <CustomerList />
    </Suspense>
  );
}
