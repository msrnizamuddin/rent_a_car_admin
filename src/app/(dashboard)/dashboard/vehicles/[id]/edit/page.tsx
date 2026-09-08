"use client";

import { useParams } from "next/navigation";
import VehicleForm from "@/components/vehicles/VehicleForm";
import DriverAssignment from "@/components/vehicles/DriverAssignment";

export default function EditVehiclePage() {
  const params = useParams<{ id: string }>();

  return (
    <div>
      <VehicleForm vehicleId={params.id} />
      <DriverAssignment vehicleId={params.id} />
    </div>
  );
}
