"use client";

import { useParams } from "next/navigation";
import VehicleCategoryForm from "@/components/vehicles/VehicleCategoryForm";

export default function EditVehicleCategoryPage() {
  const params = useParams<{ id: string }>();
  return <VehicleCategoryForm categoryId={params.id} />;
}
