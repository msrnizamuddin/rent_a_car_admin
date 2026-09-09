"use client";

import { useParams } from "next/navigation";
import TouristSpotForm from "@/components/tourist-spots/TouristSpotForm";

export default function EditTouristSpotPage() {
  const params = useParams<{ id: string }>();
  return <TouristSpotForm touristSpotId={params.id} />;
}
