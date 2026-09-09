"use client";

import { useParams } from "next/navigation";
import DriverDetail from "@/components/drivers/DriverDetail";

export default function DriverDetailPage() {
  const params = useParams<{ id: string }>();
  return <DriverDetail id={params.id} />;
}
