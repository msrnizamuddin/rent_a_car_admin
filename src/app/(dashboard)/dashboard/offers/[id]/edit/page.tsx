"use client";

import { useParams } from "next/navigation";
import OfferForm from "@/components/offers/OfferForm";

export default function EditOfferPage() {
  const params = useParams<{ id: string }>();
  return <OfferForm offerId={params.id} />;
}
