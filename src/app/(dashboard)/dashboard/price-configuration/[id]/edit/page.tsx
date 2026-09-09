"use client";

import { useParams } from "next/navigation";
import PricingForm from "@/components/pricing/PricingForm";

export default function EditPriceConfigurationPage() {
  const params = useParams<{ id: string }>();
  return <PricingForm pricingId={params.id} />;
}
