import { Suspense } from "react";
import DriverList from "@/components/drivers/DriverList";

export default function DriversPage() {
  return (
    <Suspense fallback={null}>
      <DriverList />
    </Suspense>
  );
}
