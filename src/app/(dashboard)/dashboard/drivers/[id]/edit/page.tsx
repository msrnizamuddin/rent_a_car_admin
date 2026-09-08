"use client";

import { useParams } from "next/navigation";
import DriverForm from "@/components/drivers/DriverForm";

export default function EditDriverPage() {
  const params = useParams<{ id: string }>();
  return <DriverForm driverId={params.id} />;
}
