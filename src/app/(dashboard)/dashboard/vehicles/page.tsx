import { Suspense } from "react";
import VehicleList from "@/components/vehicles/VehicleList";

export default function VehiclesPage() {
  return (
    <Suspense fallback={null}>
      <VehicleList />
    </Suspense>
  );
}
